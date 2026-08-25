import { redirect } from "next/navigation";

/** Lessons placeholder retired — use course teaching tools. */
export default function Page() {
  redirect("/instructor/courses");
}
