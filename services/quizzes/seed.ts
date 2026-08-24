/**
 * Seed demo question bank + published quiz for ATPL courses.
 */

import { generateId } from "@/lib/security/crypto";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { listCourses } from "@/services/courses/course-service";
import { readQuizzesDb, writeQuizzesDb } from "@/services/quizzes/store";
import type {
  BankQuestion,
  QuestionBankCategory,
  Quiz,
  QuizQuestionLink,
} from "@/types/quizzes";

export function ensureQuizzesSeeded(): void {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  const db = readQuizzesDb();
  if (db.seeded && db.quizzes.length > 0) return;

  const instructor = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR);
  const course = listCourses({ pageSize: 50, status: "published" }).data[0];
  const stamp = new Date().toISOString();

  const category: QuestionBankCategory = {
    id: generateId(),
    name: "Air Law Fundamentals",
    slug: "air-law-fundamentals",
    subject: "010 Air Law",
    moduleLabel: "ICAO Basics",
    parentId: null,
    description: "Core ATPL air law theory",
    order: 1,
    createdAt: stamp,
    updatedAt: stamp,
  };

  const mkOpt = (id: string, label: string, order: number) => ({ id, label, order });

  const questions: BankQuestion[] = [
    {
      id: generateId(),
      stem: "Which Annex to the Chicago Convention covers Rules of the Air?",
      type: "multiple_choice_single",
      difficulty: "medium",
      categoryId: category.id,
      subject: "010 Air Law",
      moduleLabel: "ICAO",
      tags: ["icao", "annex"],
      options: [
        mkOpt("a", "Annex 1", 1),
        mkOpt("b", "Annex 2", 2),
        mkOpt("c", "Annex 6", 3),
        mkOpt("d", "Annex 14", 4),
      ],
      correctAnswer: "b",
      explanation: "Annex 2 — Rules of the Air.",
      points: 2,
      externalId: "P100-DEMO-001",
      externalSource: "pilot100",
      metadata: {},
      createdById: instructor?.id ?? null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    },
    {
      id: generateId(),
      stem: "VFR flight is permitted in IMC.",
      type: "true_false",
      difficulty: "easy",
      categoryId: category.id,
      subject: "010 Air Law",
      moduleLabel: "VFR",
      tags: ["vfr"],
      options: [mkOpt("true", "True", 1), mkOpt("false", "False", 2)],
      correctAnswer: "false",
      explanation: "VFR requires VMC; IMC requires IFR.",
      points: 1,
      externalId: null,
      externalSource: null,
      metadata: {},
      createdById: instructor?.id ?? null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    },
    {
      id: generateId(),
      stem: "Select all documents typically required on board an aircraft for international flight.",
      type: "multiple_choice_multiple",
      difficulty: "hard",
      categoryId: category.id,
      subject: "010 Air Law",
      moduleLabel: "Operations",
      tags: ["documents"],
      options: [
        mkOpt("a", "Certificate of Airworthiness", 1),
        mkOpt("b", "Certificate of Registration", 2),
        mkOpt("c", "Crew licences", 3),
        mkOpt("d", "Passenger meal vouchers", 4),
      ],
      correctAnswer: ["a", "b", "c"],
      explanation: "Standard aircraft documents — meal vouchers are not required.",
      points: 3,
      externalId: null,
      externalSource: null,
      metadata: {},
      createdById: instructor?.id ?? null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    },
    {
      id: generateId(),
      stem: "The abbreviation for Instrument Landing System is ____.",
      type: "fill_blank",
      difficulty: "easy",
      categoryId: category.id,
      subject: "010 Air Law",
      moduleLabel: "Nav",
      tags: ["ils"],
      options: [],
      correctAnswer: ["ILS", "ils"],
      explanation: "ILS = Instrument Landing System.",
      points: 1,
      externalId: null,
      externalSource: null,
      metadata: {},
      createdById: instructor?.id ?? null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    },
    {
      id: generateId(),
      stem: "Briefly explain the purpose of a NOTAM.",
      type: "short_answer",
      difficulty: "medium",
      categoryId: category.id,
      subject: "010 Air Law",
      moduleLabel: "AIS",
      tags: ["notam"],
      options: [],
      correctAnswer: null,
      explanation: "Notice to Airmen — time-critical aeronautical information.",
      points: 3,
      externalId: null,
      externalSource: null,
      metadata: {},
      createdById: instructor?.id ?? null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    },
    {
      id: generateId(),
      stem: "Order the standard approach sequence from first to last.",
      type: "ordering",
      difficulty: "medium",
      categoryId: category.id,
      subject: "010 Air Law",
      moduleLabel: "Procedures",
      tags: ["approach"],
      options: [
        mkOpt("1", "Initial approach", 1),
        mkOpt("2", "Intermediate approach", 2),
        mkOpt("3", "Final approach", 3),
        mkOpt("4", "Missed approach", 4),
      ],
      correctAnswer: ["1", "2", "3", "4"],
      explanation: "Standard instrument approach segments.",
      points: 2,
      externalId: null,
      externalSource: null,
      metadata: {},
      createdById: instructor?.id ?? null,
      createdAt: stamp,
      updatedAt: stamp,
      deletedAt: null,
    },
  ];

  const quiz: Quiz = {
    id: generateId(),
    title: "ATPL Air Law — Progress Check",
    description: "Formative knowledge check covering ICAO basics and VFR/IFR concepts.",
    courseId: course?.id ?? null,
    moduleId: null,
    lessonId: null,
    status: "published",
    passingScore: 70,
    totalMarks: questions.reduce((s, q) => s + q.points, 0),
    timeLimitMinutes: 30,
    maxAttempts: 3,
    randomQuestions: false,
    randomAnswers: true,
    negativeMarking: false,
    negativeMarkValue: 0.25,
    showResultsImmediately: true,
    reviewAnswers: true,
    availableFrom: null,
    availableUntil: null,
    autoSubmitOnExpiry: true,
    allowResume: true,
    preventDuplicateAttempts: true,
    questionCount: null,
    instructions: "Answer all questions. Auto-save is enabled. Essay/short answers may require instructor review.",
    createdById: instructor?.id ?? null,
    createdAt: stamp,
    updatedAt: stamp,
    deletedAt: null,
    archivedAt: null,
    publishedAt: stamp,
  };

  const links: QuizQuestionLink[] = questions.map((q, i) => ({
    id: generateId(),
    quizId: quiz.id,
    questionId: q.id,
    order: i + 1,
    pointsOverride: null,
  }));

  writeQuizzesDb((d) => {
    d.categories = [category];
    d.questions = questions;
    d.quizzes = [quiz];
    d.quizQuestions = links;
    d.seeded = true;
  });
}
