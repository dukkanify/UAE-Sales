"use client";

import { CategoryManager } from "@/features/courses/components/category-manager";

export default function AdminCategoriesPage() {
  return <CategoryManager basePath="/admin/courses" roleLabel="Admin" />;
}
