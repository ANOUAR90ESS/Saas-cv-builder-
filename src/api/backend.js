// The single seam between this app and whatever backend is behind it.
//
// Every network call the frontend makes goes through one of the functions
// below. Nothing else in src/ imports a backend SDK. That is the whole point:
// swapping providers becomes a change to this file rather than a hunt through
// thirty call sites, and any component can be read without knowing which
// service is answering.
//
// Errors are normalised here too. A refusal for want of a session arrives as a
// status on one call and a code in the body on another, and callers that have
// to tell "sign in" from "try again" should not each learn both shapes.

/**
 * Thrown when the backend refused for want of a session. Retrying cannot help,
 * so the UI says "sign in" rather than "something went wrong".
 */
export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthRequiredError";
  }
}

/**
 * Calls a Supabase edge function. Its client reports transport failures on
 * `error` and the function's own 4xx/5xx body on `data`, so both are unpacked
 * into the exceptions the callers already expect.
 */
async function callFunction(name, body = {}) {
  const res = await fetch(`/api/functions/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new AuthRequiredError();
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `${name} failed with status ${res.status}`);
  }
  
  const data = await res.json();
  if (data?.error) {
    if (data.code === "auth_required") throw new AuthRequiredError();
    throw new Error(data.error);
  }
  return data;
}

// ---------------------------------------------------------------- AI

/**
 * Improves the user's own writing — a summary, bullet points, skill names.
 * `lang` decides the language of the reply, not of the input.
 * Returns whatever shape the action produces: a string, or a list of strings.
 */
export async function aiAssist(action, { lang, text, context } = {}) {
  const data = await callFunction("ai-assist", { action, lang, text, context });
  return data?.result;
}

/**
 * Analyzes fit between a candidate CV and target job description.
 */
export async function analyzeJobFit({ jobDescription, cv, lang } = {}) {
  return aiAssist("analyze_job_fit", {
    lang,
    context: { job_description: jobDescription, cv }
  });
}

/**
 * Generates a targeted, truthful cover letter matching candidate CV to a job.
 */
export async function generateCoverLetter({ jobTitle, company, jobDescription, cv, profile, tone, lang } = {}) {
  return aiAssist("generate_cover_letter", {
    lang,
    context: {
      job_title: jobTitle,
      company,
      job_description: jobDescription,
      cv,
      profile,
      tone
    }
  });
}

/**
 * Generates an interview question for practice.
 */
export async function getInterviewQuestion({ jobTitle, experienceLevel, interviewType, questionNumber, history, cv, lang } = {}) {
  return aiAssist("interview_question", {
    lang,
    context: {
      job_title: jobTitle,
      experience_level: experienceLevel,
      interview_type: interviewType,
      question_number: questionNumber,
      history,
      cv
    }
  });
}

/**
 * Evaluates candidate's answer to an interview question.
 */
export async function evaluateInterviewAnswer({ question, answer, jobTitle, experienceLevel, interviewType, cv, lang } = {}) {
  return aiAssist("interview_evaluate", {
    lang,
    context: {
      question,
      answer,
      job_title: jobTitle,
      experience_level: experienceLevel,
      interview_type: interviewType,
      cv
    }
  });
}

/**
 * Provides comprehensive debrief and summary for an interview session.
 */
export async function getInterviewSummary({ history, jobTitle, experienceLevel, interviewType, lang } = {}) {
  return aiAssist("interview_summary", {
    lang,
    context: {
      history,
      job_title: jobTitle,
      experience_level: experienceLevel,
      interview_type: interviewType
    }
  });
}

/**
 * Turns a pasted or uploaded profile into the CV shape the builder uses.
 * `lang` is only a tie-breaker: imported content keeps the language it was
 * written in, because translating someone's own CV is not importing it.
 */
export async function importProfile(payload = {}) {
  const data = await callFunction("import-profile", payload);
  return data?.result;
}

// ---------------------------------------------------------------- files

/**
 * Stores a file and returns a Data URL that can be put straight into an `<img>` or
 * handed to the import parser. Runs purely local-first and works offline.
 */
export async function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------- misc

/** Sends the contact form. Resolves when it has been accepted for delivery. */
export async function sendContact({ name, email, subject, message }) {
  await callFunction("contact", { name, email, subject, message });
}

/** Erases the account and everything the backend holds for it. Irreversible. */
export async function deleteAccount() {
  await callFunction("delete-account", {});
}
