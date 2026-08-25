import { redirect } from "next/navigation";

/** Assignments placeholder retired — use quizzes and courses. */
export default function Page() {
  redirect("/instructor/courses");
}
