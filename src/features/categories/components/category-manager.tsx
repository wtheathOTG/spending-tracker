"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";
import { ColorPickerField } from "@/components/color-picker-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCategories, useCategoryMutations } from "../hooks/use-categories";
import { getOtherCategoryOption } from "../utils";
import type { TransactionType } from "@/features/transactions/types";

function CategorySection({ type }: { type: TransactionType }) {
  const categories = useCategories(type);
  const { createCategory, updateCategory, removeCategory } =
    useCategoryMutations();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | undefined>();
  const [editingId, setEditingId] =
    useState<Id<"categories"> | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"categories"> | null>(null);

  async function handleCreate() {
    setIsCreating(true);
    try {
      await createCategory({ type, name, color });
      setName("");
      setColor(undefined);
      toast.success("Category added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Category failed");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdate() {
    if (!editingId) return;

    try {
      await updateCategory({
        id: editingId,
        name: editingName,
        color: editingColor,
      });
      setEditingId(null);
      setEditingName("");
      setEditingColor(undefined);
      toast.success("Category updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function handleDelete(id: Id<"categories">) {
    setDeletingId(id);
    try {
      const result = await removeCategory({ id });
      toast.success(
        result.changedTransactions
          ? `Category deleted. ${result.changedTransactions} transactions changed to Other.`
          : "Category deleted",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  function startEditing(category: NonNullable<typeof categories>[number]) {
    setEditingId(category._id);
    setEditingName(category.name);
    setEditingColor(category.color);
  }

  const other = getOtherCategoryOption(type);

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`${type}-category`}>New category</Label>
        <div className="flex gap-2">
          <Input
            id={`${type}-category`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Category name"
            onKeyDown={(event) => {
              if (event.key === "Enter" && name.trim()) {
                void handleCreate();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        <ColorPickerField
          id={`${type}-category-color`}
          value={color}
          onChange={setColor}
        />
      </div>

      <div className="rounded-md border">
        <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">
          <span>Categories</span>
          <Badge variant="secondary">{(categories?.length ?? 0) + 1}</Badge>
        </div>
        <div className="divide-y">
          {(categories ?? []).map((category) => (
            <div
              key={category._id}
              className="flex min-h-12 cursor-pointer flex-col gap-3 px-3 py-2 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
              onClick={() => {
                if (editingId !== category._id) {
                  startEditing(category);
                }
              }}
            >
              {editingId === category._id ? (
                <div className="grid flex-1 gap-2">
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && editingName.trim()) {
                        void handleUpdate();
                      }
                    }}
                  />
                  <ColorPickerField
                    id={`${category._id}-color`}
                    label="Category color"
                    value={editingColor}
                    onChange={setEditingColor}
                  />
                </div>
              ) : (
                <div className="flex flex-1 items-center gap-2">
                  {category.color ? (
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  ) : null}
                  <span className="text-sm">{category.name}</span>
                </div>
              )}

              <div
                className="flex items-center gap-1"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {editingId === category._id ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        void handleUpdate();
                      }}
                      disabled={!editingName.trim()}
                    >
                      Save
                    </Button>
                  <Button
                    size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                        setEditingColor(undefined);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() => startEditing(category)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                )}
                {editingId !== category._id ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="Delete">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Existing transactions in this category will be changed
                          to Other.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(category._id)}
                          disabled={deletingId === category._id}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </div>
            </div>
          ))}
          <div className="flex min-h-12 items-center justify-between gap-3 px-3 py-2">
            <span className="text-sm">{other.name}</span>
            <Badge variant="outline">Permanent</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryManager() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Categories</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Categories</DialogTitle>
          <DialogDescription>
            Add categories or delete existing ones. Deleted categories move
            transactions to Other.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="expense">
          <TabsList>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          <TabsContent value="expense" className="pt-4">
            <CategorySection type="expense" />
          </TabsContent>
          <TabsContent value="income" className="pt-4">
            <CategorySection type="income" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
