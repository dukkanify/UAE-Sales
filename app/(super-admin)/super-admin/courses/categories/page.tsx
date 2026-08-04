"use client";

import { CategoryManager } from "@/features/courses/components/category-manager";

export default function SuperAdminCategoriesPage() {
  return <CategoryManager basePath="/super-admin/courses" roleLabel="Super Admin" />;
}
