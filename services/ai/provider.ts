/**
 * Intent detection + deterministic grounded response generation (upgradeable provider).
 */

import { generateId } from "@/lib/security/crypto";
import type {
  AiAssistantPersona,
  AiDifficulty,
  AiGeneratedQuestion,
  AiIntent,
  AiUserContext,
} from "@/types/ai";

export function detectIntent(message: string, persona: AiAssistantPersona): AiIntent {
  const m = message.toLowerCase();
  if (/\b(search|find|show|list|upcoming classes|unpaid|invoice|attendance)\b/.test(m)) {
    return "search";
  }
  if (/\b(recommend|suggestion|what should i (study|take)|next course)\b/.test(m)) {
    return "recommend";
  }
  if (/\b(study plan|planner|schedule|daily plan|weekly plan|exam prep)\b/.test(m)) {
    return "study_plan";
  }
  if (/\b(summarize|summary|tldr|overview of)\b/.test(m)) return "summarize";
  if (/\b(explain|what is|concept|help me understand)\b/.test(m)) return "explain";
  if (/\b(practice|quiz|mcq|flashcard|true\/false|question)\b/.test(m)) {
    return "practice_questions";
  }
  if (/\b(study tip|how to study|revision tip)\b/.test(m)) return "study_tips";
  if (/\b(exam|atpl exam|prepare for)\b/.test(m)) return "exam_prep";
  if (persona !== "student") {
    if (/\b(objective|learning outcome)\b/.test(m)) return "lesson_objectives";
    if (/\b(assignment)\b/.test(m)) return "assignment";
    if (/\b(announcement)\b/.test(m)) return "announcement";
    if (/\b(email|message draft)\b/.test(m)) return "email";
    if (/\b(rewrite|improve|write|description|blog|faq)\b/.test(m)) return "writing";
  }
  if (persona === "admin") {
    if (/\b(insight|at risk|engagement|performance|trend)\b/.test(m)) return "insights";
    if (/\b(report|executive summary)\b/.test(m)) return "report";
  }
  if (/\b(remind|notification|re-engage)\b/.test(m)) return "notification";
  return "chat";
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function generateAssistantReply(input: {
  message: string;
  persona: AiAssistantPersona;
  intent: AiIntent;
  context: AiUserContext;
}): string {
  const { message, persona, intent, context } = input;
  const courseLine =
    context.enrolledCourses.length > 0
      ? context.enrolledCourses
          .slice(0, 4)
          .map((c) => `• ${c.code || c.title} (${c.progress}% progress)`)
          .join("\n")
      : "• No enrolled courses on record yet.";

  const grounded =
    persona === "student"
      ? `I’m grounding this in your enrolled courses:\n${courseLine}\nQuiz average on record: ${context.quizAvg}%.`
      : persona === "instructor"
        ? `I’m grounding this in your assigned courses:\n${courseLine}`
        : `Platform context: ${context.enrolledCourses.length} courses visible, ${context.liveUpcoming} upcoming live sessions.`;

  switch (intent) {
    case "explain":
      return [
        `Here’s a clear explanation based on your ATPL training context.`,
        grounded,
        ``,
        `**Concept breakdown**`,
        `1. Start from the definition used in your syllabus.`,
        `2. Connect it to a real flight / ops scenario.`,
        `3. Check understanding with one practice question.`,
        ``,
        `You asked: “${trimAsk(message)}”`,
        `Focus next on the weakest progress course above, then revisit related lessons.`,
      ].join("\n");
    case "summarize":
      return [
        `**Summary**`,
        grounded,
        ``,
        `• Key idea: master the learning outcomes before memorizing details.`,
        `• Priority topics: navigation, meteorology, and performance where progress is lowest.`,
        `• Action: complete one unfinished lesson today, then quiz yourself tomorrow.`,
        ``,
        `This summary uses only platform enrollment/progress data — no invented course content.`,
      ].join("\n");
    case "study_tips":
      return [
        `**Study tips for ${context.roleLabel.toLowerCase()}s**`,
        grounded,
        ``,
        `1. Use 45/10 focus blocks on your lowest-progress course.`,
        `2. End each session with 5 flashcards.`,
        `3. Schedule live-class review within 24h.`,
        `4. Track weekly hours against your goals${context.goals[0] ? ` (${context.goals[0]})` : ""}.`,
      ].join("\n");
    case "recommend":
      return [
        `**Course recommendations**`,
        grounded,
        ``,
        ...context.enrolledCourses.slice(0, 3).map(
          (c, i) =>
            `${i + 1}. Continue **${c.title}** — currently ${c.progress}% complete.`,
        ),
        context.enrolledCourses.length
          ? `After finishing your active path, explore related categories in the catalog.`
          : `Browse the catalog and enroll to unlock personalized recommendations.`,
      ].join("\n");
    case "practice_questions":
      return formatQuestions(
        buildPracticeQuestions(message, "medium", context),
      );
    case "exam_prep":
      return [
        `**Exam preparation plan**`,
        grounded,
        ``,
        `Week focus: revise weak areas (<50% progress), then timed quizzes.`,
        `Day before exam: light review + sleep; avoid new topics.`,
        `Use your enrolled syllabus only — ask your instructor for official exam policies.`,
      ].join("\n");
    case "study_plan":
      return [
        `**Suggested study plan**`,
        grounded,
        ``,
        `Daily: 1 lesson + 10 practice questions.`,
        `Weekly: 2 live-class reviews + 1 mock quiz.`,
        `Monthly: full module revision + progress check.`,
        ``,
        `Open **AI Study Planner** tools to generate an editable plan you can accept into your calendar.`,
      ].join("\n");
    case "lesson_objectives":
      return [
        `**Lesson objectives**`,
        `By the end of this lesson, learners will be able to:`,
        `1. Define the core concept in aviation terms.`,
        `2. Apply the procedure in a sample scenario.`,
        `3. Identify common errors and mitigations.`,
        `4. Complete a short formative check.`,
        grounded,
      ].join("\n");
    case "assignment":
      return [
        `**Assignment draft**`,
        `Title: Applied knowledge check`,
        `Instructions: Complete the scenario worksheet using only course materials.`,
        `Deliverable: short written response (300–500 words) + 3 reflection points.`,
        `Rubric: accuracy 40%, reasoning 40%, clarity 20%.`,
        grounded,
      ].join("\n");
    case "announcement":
      return [
        `**Announcement draft**`,
        `Subject: Important update for your course`,
        ``,
        `Hello team,`,
        `Please review this week’s materials and confirm attendance for upcoming live sessions (${context.liveUpcoming} upcoming on the platform).`,
        `Reach out via Support if you need help.`,
        `— ${context.roleLabel}`,
      ].join("\n");
    case "email":
      return [
        `**Email draft**`,
        `Subject: Follow-up on your progress`,
        ``,
        `Hi,`,
        `I wanted to share a brief update and encourage you to continue with your enrolled pathway.`,
        `Next step: complete the next lesson and attempt a short quiz.`,
        `Best regards,`,
        context.roleLabel,
      ].join("\n");
    case "writing":
      return [
        `**Professional rewrite**`,
        `Here is a clearer version of your request:`,
        ``,
        `“${trimAsk(message)}” → polished for aviation learners with concise structure, outcome-focused language, and a call to action.`,
        grounded,
      ].join("\n");
    case "insights":
    case "report":
      return [
        `**${intent === "report" ? "Executive summary" : "AI insights"}**`,
        grounded,
        ``,
        `• Monitor students with low progress / attendance.`,
        `• Highlight courses with completion gaps.`,
        `• Use Analytics BI dashboards for live KPIs — I never invent platform metrics.`,
        `Ask “students at risk” or open Analytics for detailed figures.`,
      ].join("\n");
    case "search":
      return [
        `**Search interpretation**`,
        `I understood: “${trimAsk(message)}”.`,
        `Use the AI Search panel / API for actionable links. Common intents: upcoming classes, ATPL lessons, low attendance, unpaid invoices.`,
        grounded,
      ].join("\n");
    case "notification":
      return [
        `**Suggested notification**`,
        `Title: Keep your momentum`,
        `Body: A short study session today will protect your progress. Open your planner to schedule 45 minutes.`,
        grounded,
      ].join("\n");
    default:
      return [
        `I’m your ${persona} AI learning assistant for ATPL PASS.`,
        grounded,
        ``,
        `I can explain lessons, summarize content, generate practice questions, build study plans, draft instructor/admin writing, and search the platform — without replacing your instructor.`,
        `Ask something specific, or pick a suggested prompt.`,
      ].join("\n");
  }
}

function trimAsk(message: string) {
  return message.trim().slice(0, 180);
}

export function buildPracticeQuestions(
  topic: string,
  difficulty: AiDifficulty,
  context: AiUserContext,
): AiGeneratedQuestion[] {
  const focus =
    context.enrolledCourses[0]?.title ??
    (topic.match(/about (.+)$/i)?.[1] ?? "aviation fundamentals");
  const base = focus.slice(0, 48);
  return [
    {
      id: generateId(),
      type: "mcq",
      difficulty,
      prompt: `Regarding ${base}, which statement is most accurate?`,
      options: [
        "Apply standard operating procedures first",
        "Ignore weather minima",
        "Skip briefings on familiar routes",
        "Disable redundant checks",
      ],
      answer: "Apply standard operating procedures first",
      explanation: "SOPs and briefings remain mandatory regardless of familiarity.",
    },
    {
      id: generateId(),
      type: "true_false",
      difficulty,
      prompt: `True or false: Progress on ${base} should be verified with formative checks before progressing.`,
      answer: "True",
      explanation: "Formative checks reduce drop-off and exam risk.",
    },
    {
      id: generateId(),
      type: "essay",
      difficulty,
      prompt: `Explain how ${base} applies in a real operational scenario (150–200 words).`,
      answer: "Model answer should cite definitions, hazards, and mitigations from the syllabus.",
      explanation: "Assess reasoning and correct terminology.",
    },
    {
      id: generateId(),
      type: "flashcard",
      difficulty,
      prompt: `Flashcard front: Key definition — ${base}`,
      answer: `Concise syllabus definition of ${base} in your own words.`,
      explanation: "Use spaced repetition after live classes.",
    },
  ];
}

function formatQuestions(qs: AiGeneratedQuestion[]) {
  return [
    `**Practice set** (${qs.length} items)`,
    ...qs.map((q, i) => {
      const opts = q.options?.map((o, idx) => `   ${String.fromCharCode(65 + idx)}. ${o}`).join("\n");
      return [
        `${i + 1}. [${q.type} · ${q.difficulty}] ${q.prompt}`,
        opts ?? "",
        `   Answer: ${q.answer}`,
        `   Why: ${q.explanation}`,
      ]
        .filter(Boolean)
        .join("\n");
    }),
  ].join("\n\n");
}

/** Simulate streaming by chunking text. */
export async function* streamText(text: string, delayMs = 12): AsyncGenerator<string> {
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    yield part;
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
}
