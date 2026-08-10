import { redirect } from "next/navigation";

/** Instructors oversight → Assignment Engine calendar & availability. */
export default function CgiInstructorsPage() {
  redirect("/cgi/assignment");
}
