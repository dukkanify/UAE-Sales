"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { courseFetch } from "@/features/courses/lib/api";
import type { CourseCategory } from "@/types/courses";

interface CategoryManagerProps {
  basePath: string;
  roleLabel: string;
}

function CategoryManager({ basePath, roleLabel }: CategoryManagerProps) {
  const [categories, setCategories] = React.useState<CourseCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [parentId, setParentId] = React.useState("none");
  const [icon, setIcon] = React.useState("Folder");

  const load = React.useCallback(async () => {
    setLoading(true);
    const result = await courseFetch<CourseCategory[]>(
      "/api/courses/categories?includeHidden=1",
    );
    setCategories(result.data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    const result = await courseFetch<CourseCategory>("/api/courses/categories", {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        parentId: parentId === "none" ? null : parentId,
        icon,
        visible: true,
      }),
    });
    if (!result.success) {
      toast.error(result.error ?? "Failed to create category");
      return;
    }
    toast.success("Category created");
    setName("");
    setDescription("");
    setParentId("none");
    void load();
  }

  async function toggleVisible(cat: CourseCategory) {
    const result = await courseFetch(`/api/courses/categories/${cat.id}`, {
      method: "PATCH",
      body: JSON.stringify({ visible: !cat.visible }),
    });
    if (!result.success) {
      toast.error(result.error ?? "Update failed");
      return;
    }
    void load();
  }

  async function remove(id: string) {
    const result = await courseFetch(`/api/courses/categories/${id}`, {
      method: "DELETE",
    });
    if (!result.success) {
      toast.error(result.error ?? "Delete failed");
      return;
    }
    toast.success("Category deleted");
    void load();
  }

  const roots = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course categories"
        description="Main categories and subcategories with icons, ordering, and visibility."
        breadcrumbs={[
          { label: roleLabel },
          { label: "Courses", href: basePath },
          { label: "Categories" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href={basePath}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to courses
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create category</CardTitle>
          <CardDescription>
            Metadata is extensible without schema changes for future taxonomy needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Parent</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Main category</SelectItem>
                {roots.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Input
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-icon">Icon key</Label>
            <Input
              id="cat-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Plane"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => void create()}>
              <Plus className="mr-2 h-4 w-4" /> Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="space-y-3">
          {roots.map((root) => {
            const children = categories.filter((c) => c.parentId === root.id);
            return (
              <Card key={root.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">
                      {root.name}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({root.icon})
                      </span>
                    </CardTitle>
                    <CardDescription>{root.description || "No description"}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={root.visible}
                        onCheckedChange={() => void toggleVisible(root)}
                        aria-label="Toggle visibility"
                      />
                      <Badge variant={root.visible ? "success" : "secondary"}>
                        {root.visible ? "Visible" : "Hidden"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete category"
                      onClick={() => void remove(root.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {children.length ? (
                  <CardContent className="space-y-2">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">↳ {child.name}</p>
                          <p className="text-xs text-muted-foreground">{child.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={child.visible}
                            onCheckedChange={() => void toggleVisible(child)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete subcategory"
                            onClick={() => void remove(child.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { CategoryManager };
