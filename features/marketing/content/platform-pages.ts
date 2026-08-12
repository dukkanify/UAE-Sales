/** Shared marketing copy for dedicated Flightpath / Live pages. */

export const FLIGHTPATH_STEPS = [
  {
    code: "01",
    title: "Course engine",
    body: "ATPL theory modules sequenced like a real syllabus — lessons, resources, and progress in one lane.",
  },
  {
    code: "02",
    title: "Live Zoom lane",
    body: "Private instructor sessions on demand. Confirm by email, then join from your training lobby.",
  },
  {
    code: "03",
    title: "Mastery loop",
    body: "Quizzes, certificates, and proof of readiness — every hour of study moves the license forward.",
  },
] as const;

export const LIVE_STEPS = [
  {
    code: "01",
    title: "Reserve a window",
    body: "Pick an instructor and an open GMT slot in the booking studio — only bookable times appear.",
  },
  {
    code: "02",
    title: "Confirm by email",
    body: "Enter your details, verify with a one-time code, and AviatorPass holds the Zoom lane for you.",
  },
  {
    code: "03",
    title: "Join from the lobby",
    body: "Your learner account opens when you confirm. Enter the Zoom lobby from My Courses when it is time.",
  },
] as const;
