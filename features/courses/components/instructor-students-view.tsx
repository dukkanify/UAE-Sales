"use client";

import { GraduationCap } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InstructorStudentRow } from "@/services/courses/instructor-students";

function InstructorStudentsView({ students }: { students: InstructorStudentRow[] }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Learners enrolled in courses assigned to you."
        breadcrumbs={[{ label: "Instructor" }, { label: "Students" }]}
      />

      {students.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-6 w-6" />}
          title="No students yet"
          description="When learners enroll in your assigned courses, they will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((row) => (
                <TableRow key={`${row.id}-${row.courseId}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{row.studentName}</p>
                      <p className="text-xs text-muted-foreground">{row.studentEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{row.courseTitle}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{Math.round(row.progressPercent)}%</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(row.enrolledAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export { InstructorStudentsView };
