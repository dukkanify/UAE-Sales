import { redirect } from "next/navigation";

/** Assignments module not shipped — route retained for bookmarks. */
export default function Page() {
  redirect("/student/courses");
}
