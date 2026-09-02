/**
 * Real-time spell and grammar checking engine for CV builder inputs.
 * Provides client-side zero-latency detection for common professional writing errors,
 * typos, duplicate words, punctuation defects, and weak phrasing with context-aware corrections.
 */

// Dictionary of over 140 common spelling and typing mistakes in resumes and professional documents
const COMMON_TYPOS = {
  // Common CV verbs and actions
  "acheive": ["achieve"],
  "acheived": ["achieved"],
  "acheiving": ["achieving"],
  "acheivement": ["achievement"],
  "acheivements": ["achievements"],
  "achive": ["achieve"],
  "achived": ["achieved"],
  "leaded": ["led"],
  "writed": ["wrote", "written"],
  "costed": ["cost"],
  "runned": ["ran", "managed"],
  "impliment": ["implement"],
  "implimented": ["implemented"],
  "implimenting": ["implementing"],
  "implimentation": ["implementation"],
  "cordinate": ["coordinate"],
  "cordinated": ["coordinated"],
  "cordinating": ["coordinating"],
  "co-ordinate": ["coordinate"],
  "colaborate": ["collaborate"],
  "colaborated": ["collaborated"],
  "colaborating": ["collaborating"],
  "colaboration": ["collaboration"],
  "maintanence": ["maintenance"],
  "maintainance": ["maintenance"],
  "maintane": ["maintain"],
  "develope": ["develop"],
  "developement": ["development"],
  "developements": ["developments"],
  "programing": ["programming"],
  "programer": ["programmer"],
  "programers": ["programmers"],
  "suceed": ["succeed"],
  "suceeded": ["succeeded"],
  "sucess": ["success"],
  "sucessful": ["successful"],
  "sucessfully": ["successfully"],
  "supervize": ["supervise"],
  "supervized": ["supervised"],
  "supervizing": ["supervising"],
  "optomize": ["optimize"],
  "optomized": ["optimized"],
  "optomization": ["optimization"],
  "designd": ["designed"],
  "faciliate": ["facilitate"],
  "faciliated": ["facilitated"],
  "analize": ["analyze"],
  "analized": ["analyzed"],
  "analisis": ["analysis"],
  "anlytics": ["analytics"],
  "negotation": ["negotiation"],
  "negotations": ["negotiations"],
  "conacted": ["contacted", "connected"],

  // Professional roles and qualifications
  "experiance": ["experience"],
  "experianced": ["experienced"],
  "experiancing": ["experiencing"],
  "responsable": ["responsible"],
  "responsabilities": ["responsibilities"],
  "responsability": ["responsibility"],
  "responisble": ["responsible"],
  "managment": ["management"],
  "maneger": ["manager"],
  "maneging": ["managing"],
  "supervison": ["supervision"],
  "profesional": ["professional"],
  "profesionals": ["professionals"],
  "profesionally": ["professionally"],
  "proffesional": ["professional"],
  "proffessional": ["professional"],
  "enviroment": ["environment"],
  "enviroments": ["environments"],
  "goverment": ["government"],
  "departement": ["department"],
  "oppurtunity": ["opportunity"],
  "oppurtunities": ["opportunities"],
  "independant": ["independent"],
  "independantly": ["independently"],
  "reccomend": ["recommend"],
  "reccomended": ["recommended"],
  "reccomendation": ["recommendation"],
  "recommand": ["recommend"],
  "curiculum": ["curriculum"],
  "bacground": ["background"],
  "tehnology": ["technology"],
  "technolgy": ["technology"],
  "techology": ["technology"],
  "comunication": ["communication"],
  "knowlege": ["knowledge"],
  "knowledgable": ["knowledgeable"],
  "iniciative": ["initiative"],
  "initative": ["initiative"],
  "certifcate": ["certificate"],
  "certificated": ["certified"],
  "certifaction": ["certification"],
  "qualifcation": ["qualification"],
  "qualifactions": ["qualifications"],
  "referance": ["reference"],
  "referances": ["references"],
  "compnay": ["company"],
  "oraganization": ["organization"],
  "oraganise": ["organize"],
  "organistion": ["organisation", "organization"],
  "collegue": ["colleague"],
  "collegues": ["colleagues"],
  "custmer": ["customer"],
  "custmers": ["customers"],
  "cleint": ["client"],
  "cleints": ["clients"],

  // Common linguistic / grammatical words
  "alot": ["a lot"],
  "untill": ["until"],
  "occured": ["occurred"],
  "occuring": ["occurring"],
  "occurence": ["occurrence"],
  "seperate": ["separate"],
  "seperated": ["separated"],
  "definately": ["definitely"],
  "definitly": ["definitely"],
  "necessery": ["necessary"],
  "neccessary": ["necessary"],
  "necesary": ["necessary"],
  "accommodate": ["accommodate"],
  "acommodate": ["accommodate"],
  "appologize": ["apologize"],
  "recieve": ["receive"],
  "recieved": ["received"],
  "recieving": ["receiving"],
  "calender": ["calendar"],
  "truely": ["truly"],
  "persue": ["pursue"],
  "persuing": ["pursuing"],
  "possession": ["possession"],
  "possesion": ["possession"],
  "wierd": ["weird"],
  "priviledge": ["privilege"],
  "judgement": ["judgment", "judgement"],
  "guarentee": ["guarantee"],
  "guarenteed": ["guaranteed"],
  "tommorow": ["tomorrow"],
  "tomorow": ["tomorrow"],
  "fourty": ["forty"],
  "foriegn": ["foreign"],
  "relevent": ["relevant"],
  "irrelevent": ["irrelevant"],
  "efficent": ["efficient"],
  "efficently": ["efficiently"],
  "suprise": ["surprise"],
  "agressive": ["aggressive"],
  "basicly": ["basically"],
  "buisness": ["business"],
  "busines": ["business"],
  "familar": ["familiar"],
  "concious": ["conscious"],
  "existance": ["existence"],
  "fascinating": ["fascinating"],
  "interupt": ["interrupt"],
  "millenium": ["millennium"],
  "noticable": ["noticeable"],
  "posibility": ["possibility"],
  "tendancy": ["tendency"],
  "unforseen": ["unforeseen"],
  "withold": ["withhold"],
  "yield": ["yield"]
};

// Grammar phrases and patterns
const GRAMMAR_RULES = [
  {
    regex: /\b(responsible for (?:handling|managing|doing|overseeing))\b/gi,
    type: "style",
    message: "Weak passive phrasing. Use an authoritative action verb instead.",
    suggestions: ["Led", "Managed", "Spearheaded", "Directed"]
  },
  {
    regex: /\b(help|helped) (with|to)\b/gi,
    type: "style",
    message: "Consider a more decisive verb.",
    suggestions: ["Facilitated", "Collaborated on", "Supported", "Engineered"]
  },
  {
    regex: /\b(their|there|they're)\b/gi,
    check: (match, before, after) => {
      // Check common misuse: "their was" -> "there was"
      if (match.toLowerCase() === "their" && /^(was|were|is|are)\b/i.test(after.trim())) {
        return {
          type: "grammar",
          message: `Did you mean "there" instead of "their"?`,
          suggestions: ["there"]
        };
      }
      return null;
    }
  },
  {
    regex: /\b(its|it's)\b/gi,
    check: (match, before, after) => {
      // "it's impact" -> "its impact"
      if (match.toLowerCase() === "it's" && /^(impact|efficiency|scalability|performance|architecture|growth|success|members|team|design)\b/i.test(after.trim())) {
        return {
          type: "grammar",
          message: `Possessive "its" does not have an apostrophe.`,
          suggestions: ["its"]
        };
      }
      return null;
    }
  }
];

/**
 * Checks text for spelling and grammar issues.
 * @param {string} text - text string to analyze
 * @returns {Array} list of issues with offset, length, word, message, suggestions
 */
export function checkSpellAndGrammar(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return [];
  }

  const issues = [];
  const lowerText = text.toLowerCase();

  // 1. Check duplicate adjacent words ("the the", "in in", "and and")
  const duplicateRegex = /\b([a-zA-Z]{2,})\s+\1\b/gi;
  let dupMatch;
  while ((dupMatch = duplicateRegex.exec(text)) !== null) {
    issues.push({
      id: `dup-${dupMatch.index}`,
      word: dupMatch[0],
      offset: dupMatch.index,
      length: dupMatch[0].length,
      type: "grammar",
      message: `Repeated word: "${dupMatch[1]}"`,
      suggestions: [dupMatch[1]]
    });
  }

  // 2. Check spacing before punctuation (e.g. "team , led" or "project .")
  const punctSpacingRegex = /(\w+)\s+([,.:;?!])/g;
  let punctMatch;
  while ((punctMatch = punctSpacingRegex.exec(text)) !== null) {
    issues.push({
      id: `punct-${punctMatch.index}`,
      word: punctMatch[0],
      offset: punctMatch.index,
      length: punctMatch[0].length,
      type: "grammar",
      message: `Unwanted space before punctuation mark "${punctMatch[2]}"`,
      suggestions: [`${punctMatch[1]}${punctMatch[2]}`]
    });
  }

  // 3. Check missing space after punctuation (e.g. "worked,built")
  const missingSpaceRegex = /([a-zA-Z]{2,})([,;:])([a-zA-Z]{2,})/g;
  let missMatch;
  while ((missMatch = missingSpaceRegex.exec(text)) !== null) {
    issues.push({
      id: `space-${missMatch.index}`,
      word: missMatch[0],
      offset: missMatch.index,
      length: missMatch[0].length,
      type: "grammar",
      message: `Missing space after "${missMatch[2]}"`,
      suggestions: [`${missMatch[1]}${missMatch[2]} ${missMatch[3]}`]
    });
  }

  // 4. Check dictionary typos
  // Split words by word boundaries
  const wordRegex = /\b[a-zA-Z'-]+\b/g;
  let match;
  while ((match = wordRegex.exec(text)) !== null) {
    const rawWord = match[0];
    const cleanWord = rawWord.toLowerCase();

    // Check direct typos
    if (COMMON_TYPOS[cleanWord]) {
      const isCapitalized = rawWord[0] === rawWord[0].toUpperCase() && rawWord[1] !== rawWord[1]?.toUpperCase();
      const isAllUpper = rawWord.length > 1 && rawWord === rawWord.toUpperCase();

      const suggestions = COMMON_TYPOS[cleanWord].map((s) => {
        if (isAllUpper) return s.toUpperCase();
        if (isCapitalized) return s.charAt(0).toUpperCase() + s.slice(1);
        return s;
      });

      issues.push({
        id: `typo-${match.index}`,
        word: rawWord,
        offset: match.index,
        length: rawWord.length,
        type: "spelling",
        message: `Possible spelling mistake. Did you mean "${suggestions[0]}"?`,
        suggestions
      });
    }
  }

  // 5. Check grammar rules
  for (const rule of GRAMMAR_RULES) {
    let ruleMatch;
    const rx = new RegExp(rule.regex);
    while ((ruleMatch = rx.exec(text)) !== null) {
      if (rule.check) {
        const before = text.slice(0, ruleMatch.index);
        const after = text.slice(ruleMatch.index + ruleMatch[0].length);
        const res = rule.check(ruleMatch[0], before, after);
        if (res) {
          issues.push({
            id: `rule-${ruleMatch.index}`,
            word: ruleMatch[0],
            offset: ruleMatch.index,
            length: ruleMatch[0].length,
            type: res.type || "grammar",
            message: res.message,
            suggestions: res.suggestions
          });
        }
      } else {
        issues.push({
          id: `rule-${ruleMatch.index}`,
          word: ruleMatch[0],
          offset: ruleMatch.index,
          length: ruleMatch[0].length,
          type: rule.type || "grammar",
          message: rule.message,
          suggestions: rule.suggestions
        });
      }
    }
  }

  // Deduplicate and sort issues by offset
  const sorted = issues.sort((a, b) => a.offset - b.offset);
  const filtered = [];
  let lastEnd = -1;

  for (const issue of sorted) {
    if (issue.offset >= lastEnd) {
      filtered.push(issue);
      lastEnd = issue.offset + issue.length;
    }
  }

  return filtered;
}

/**
 * Replaces an identified issue in a text string with a chosen replacement.
 * @param {string} text - original text
 * @param {object} issue - issue object containing offset and length
 * @param {string} replacement - replacement string
 * @returns {string} updated text
 */
export function applyCorrection(text, issue, replacement) {
  if (!text || !issue) return text;
  const start = issue.offset;
  const end = issue.offset + issue.length;
  return text.slice(0, start) + replacement + text.slice(end);
}

/**
 * Replaces all identified issues in a text string using their first suggestion.
 * @param {string} text - original text
 * @param {Array} issues - array of issue objects
 * @returns {string} updated text with all fixes applied
 */
export function applyAllCorrections(text, issues) {
  if (!text || !issues || !issues.length) return text;

  // Sort in reverse order of offset to preserve indices
  const reverseIssues = [...issues].sort((a, b) => b.offset - a.offset);
  let updated = text;

  for (const issue of reverseIssues) {
    if (issue.suggestions && issue.suggestions.length > 0) {
      const replacement = issue.suggestions[0];
      updated = updated.slice(0, issue.offset) + replacement + updated.slice(issue.offset + issue.length);
    }
  }

  return updated;
}
