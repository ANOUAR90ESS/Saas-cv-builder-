import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Bot,
  Sparkles,
  Mic,
  MicOff,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Compass,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { loadAllCVs, getActiveId } from "@/lib/cvStorage";
import {
  getInterviewQuestion,
  evaluateInterviewAnswer,
  getInterviewSummary
} from "@/api/backend";
import {
  saveInterviewSession
} from "@/lib/careerStorage";
import { triggerHaptic } from "@/lib/haptics";
import confetti from "canvas-confetti";

export default function InterviewCoach() {
  const location = useLocation();

  const [cvs, setCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState(location.state?.cvId || "");
  const [jobTitle, setJobTitle] = useState(location.state?.jobTitle || "Frontend Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [interviewType, setInterviewType] = useState("Behavioral & Leadership");

  // Interview state
  const [sessionActive, setSessionActive] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [history, setHistory] = useState([]);
  const [sessionSummary, setSessionSummary] = useState(null);

  // Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const loaded = loadAllCVs() || [];
    setCvs(loaded);
    const active = location.state?.cvId || getActiveId() || loaded[0]?.id || "";
    setSelectedCvId(active);

    // Initialize speech recognition if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setUserAnswer(transcript.trim());
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [location.state]);

  const activeCv = cvs.find((c) => c.id === selectedCvId) || cvs[0] || null;

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type your answer.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setUserAnswer("");
      recognitionRef.current.start();
      setIsListening(true);
      triggerHaptic("selection");
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setSessionActive(true);
    setQuestionNumber(1);
    setHistory([]);
    setLastEvaluation(null);
    setSessionSummary(null);
    triggerHaptic("selection");

    try {
      const res = await getInterviewQuestion({
        jobTitle,
        experienceLevel,
        interviewType,
        questionNumber: 1,
        history: [],
        cv: activeCv,
        lang: "en"
      });

      const qText = typeof res === "string" ? res : res?.question || `Tell me about your experience as a ${jobTitle}.`;
      setCurrentQuestion(qText);
    } catch (err) {
      console.error(err);
      setCurrentQuestion(`Describe a challenging technical project you worked on as a ${jobTitle} and how you handled unexpected obstacles.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setEvaluating(true);
    triggerHaptic("selection");

    try {
      const evalRes = await evaluateInterviewAnswer({
        question: currentQuestion,
        answer: userAnswer,
        jobTitle,
        experienceLevel,
        interviewType,
        cv: activeCv,
        lang: "en"
      });

      setLastEvaluation(evalRes);
      const entry = {
        questionNumber,
        question: currentQuestion,
        answer: userAnswer,
        score: evalRes?.score || 75,
        evaluation: evalRes?.evaluation,
        feedback: evalRes?.feedback,
        betterAnswer: evalRes?.betterAnswer
      };
      setHistory((prev) => [...prev, entry]);
    } catch (err) {
      console.error(err);
      setLastEvaluation({
        score: 75,
        evaluation: { relevance: 78, clarity: 76, structure: 72, confidence: 75, specificity: 74 },
        feedback: {
          whatWasGood: "You addressed the core premise directly.",
          whatToImprove: "Structure your response with clear milestones and measurable outcomes."
        },
        betterAnswer: "In my recent position, I addressed this challenge by aligning requirements, implementing structured tests, and delivering the milestone on schedule."
      });
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = async () => {
    if (questionNumber >= totalQuestions) {
      // Finish interview
      handleFinishInterview();
      return;
    }

    const nextQNum = questionNumber + 1;
    setQuestionNumber(nextQNum);
    setUserAnswer("");
    setLastEvaluation(null);
    setLoading(true);
    triggerHaptic("selection");

    try {
      const res = await getInterviewQuestion({
        jobTitle,
        experienceLevel,
        interviewType,
        questionNumber: nextQNum,
        history,
        cv: activeCv,
        lang: "en"
      });

      const qText = typeof res === "string" ? res : res?.question || `What is your approach to collaboration in high-velocity teams?`;
      setCurrentQuestion(qText);
    } catch (err) {
      console.error(err);
      setCurrentQuestion(`How do you measure success and maintain quality in your deliverables as a ${jobTitle}?`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishInterview = async () => {
    setLoading(true);
    triggerHaptic("success");

    try {
      const summary = await getInterviewSummary({
        history,
        jobTitle,
        experienceLevel,
        interviewType,
        lang: "en"
      });

      setSessionSummary(summary);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Persist session
      saveInterviewSession({
        jobTitle,
        experienceLevel,
        interviewType,
        score: summary?.interviewScore || 78,
        history,
        summary,
        date: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setSessionSummary({
        interviewScore: 80,
        strengths: ["Clear communication", "Grounded domain knowledge", "Professional poise"],
        areasToImprove: ["Quantify impact with metrics", "Use STAR method consistently"],
        recommendedQuestions: [
          "How do you resolve disagreements in architectural decisions?",
          "Describe your experience mentoring junior colleagues."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Banner */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
                <Bot size={14} />
                <span>Interactive Mock Coach</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                AI Interview Coach
              </h1>
              <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                Practice tailored interview questions with instant scoring, feedback, voice input, and STAR model optimization grounded in your real background.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground self-start md:self-auto px-3 py-2 rounded-xl border border-border bg-background transition"
            >
              <Compass size={14} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!sessionActive && !sessionSummary ? (
          /* Pre-Session Setup */
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">Configure Mock Interview</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize your practice role, seniority level, and question focus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select CV */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Candidate CV
                </label>
                <select
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {cvs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title || c.personal?.full_name || "Untitled CV"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Job Title */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Target Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Seniority */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Seniority Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Entry-Level / Junior">Entry-Level / Junior</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead / Staff / Principal">Lead / Staff / Principal</option>
                </select>
              </div>

              {/* Interview Category */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Interview Type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Behavioral & Leadership">Behavioral & Leadership</option>
                  <option value="Technical & Architecture">Technical & Architecture</option>
                  <option value="General & Culture Fit">General & Culture Fit</option>
                  <option value="Role-Specific Deep Dive">Role-Specific Deep Dive</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-3 text-xs text-muted-foreground">
              <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                DexaCV's Interview Coach asks realistic questions one by one. You can speak your answer with the microphone or type it. After each question, you get immediate constructive feedback and a polished model answer.
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartInterview}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Preparing Questions...</span>
                </>
              ) : (
                <>
                  <Bot size={16} />
                  <span>Start Mock Interview</span>
                </>
              )}
            </button>
          </div>
        ) : sessionSummary ? (
          /* Final Interview Summary */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Interview Completed
                  </span>
                  <h2 className="text-2xl font-extrabold text-foreground mt-1">
                    Performance Debrief & Summary
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {jobTitle} • {experienceLevel} • {interviewType}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-primary">
                      {sessionSummary.interviewScore || 80}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Score</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Areas for Improvement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Strengths */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Standout Strengths
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-foreground">
                    {(sessionSummary.strengths || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Growth */}
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      High-Priority Areas to Improve
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-foreground">
                    {(sessionSummary.areasToImprove || []).map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended practice questions */}
              {sessionSummary.recommendedQuestions && sessionSummary.recommendedQuestions.length > 0 && (
                <div className="mt-6 p-4 rounded-xl border border-border bg-background">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary" />
                    <span>Recommended Practice Questions for Next Round</span>
                  </h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {sessionSummary.recommendedQuestions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="font-bold text-primary">{i + 1}.</span>
                        <span className="text-foreground">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSessionActive(false);
                    setSessionSummary(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition inline-flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Start New Practice Session</span>
                </button>

                <Link
                  to="/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition inline-flex items-center gap-1.5"
                >
                  <span>Return to Career Dashboard</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Active Question & Answer Stage */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Stage Progress Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Question {questionNumber} of {totalQuestions}
                </span>
                <span className="text-xs text-muted-foreground">• {interviewType}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("End the current mock interview?")) {
                    handleFinishInterview();
                  }
                }}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                End Session Early
              </button>
            </div>

            {/* Question Card */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">
                  Q
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    {currentQuestion || "Loading question..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tip: Structure with Situation, Task, Action, and Measurable Result (STAR).
                  </p>
                </div>
              </div>
            </div>

            {/* User Answer Input Box */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Answer
                </label>

                {/* Voice Input Toggle */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse"
                      : "border border-border bg-background hover:bg-muted text-foreground"
                  }`}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{isListening ? "Listening (Tap to stop)..." : "Voice Answer"}</span>
                </button>
              </div>

              <textarea
                rows={6}
                placeholder="Speak using the microphone or type your response here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={evaluating || Boolean(lastEvaluation)}
                className="w-full p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-sans leading-relaxed"
              />

              {!lastEvaluation && (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || evaluating}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {evaluating ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Evaluating Answer with AI...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Submit Answer for Evaluation</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Answer Evaluation & Feedback */}
            {lastEvaluation && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Coach Evaluation
                    </span>
                    <h3 className="text-base font-bold text-foreground mt-0.5">
                      Question Score: {lastEvaluation.score || 78} / 100
                    </h3>
                  </div>

                  {/* Sub-scores */}
                  {lastEvaluation.evaluation && (
                    <div className="hidden sm:flex items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-muted font-medium">
                        Relevance: {lastEvaluation.evaluation.relevance}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-muted font-medium">
                        Clarity: {lastEvaluation.evaluation.clarity}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-muted font-medium">
                        Structure: {lastEvaluation.evaluation.structure}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Feedback Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                      ✓ What Was Good
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {lastEvaluation.feedback?.whatWasGood || "Addressed the core intent well."}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                      ⚠ How to Strengthen It
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {lastEvaluation.feedback?.whatToImprove || "Consider framing concrete outcomes."}
                    </p>
                  </div>
                </div>

                {/* Better Answer grounded in user's background */}
                {lastEvaluation.betterAnswer && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs">
                    <span className="font-bold text-primary block mb-1">
                      ★ Exemplary STAR Response (tailored to your experience):
                    </span>
                    <p className="text-foreground leading-relaxed italic">
                      "{lastEvaluation.betterAnswer}"
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Loading Next Question...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {questionNumber >= totalQuestions ? "Finish Interview & View Report" : "Proceed to Next Question"}
                      </span>
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
