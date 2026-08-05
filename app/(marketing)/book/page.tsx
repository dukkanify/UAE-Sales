import type { Metadata } from "next";

import { BookStudioClient } from "./book-studio-client";

export const metadata: Metadata = {
  title: "Book live Zoom",
  description:
    "Reserve live ATPL coaching on the ATPL PASS platform — confirm by email, account created on the spot.",
};

export default function PublicBookPage() {
  return (
    <div className="container-app">
      <BookStudioClient />
    </div>
  );
}
