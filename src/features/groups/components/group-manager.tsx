"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";
import { ColorPickerField } from "@/components/color-picker-field";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useGroupMutations, useGroups } from "../hooks/use-groups";

export function GroupManager() {
  const groups = useGroups();
  const { createGroup, updateGroup, removeGroup } = useGroupMutations();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | undefined>();
  const [editingId, setEditingId] = useState<Id<"groups"> | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate() {
    setIsSaving(true);
    try {
      await createGroup({ name, color });
      setName("");
      setColor(undefined);
      toast.success("Group added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Group failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editingId) return;

    setIsSaving(true);
    try {
      await updateGroup({ id: editingId, name: editingName, color: editingColor });
      setEditingId(null);
      setEditingName("");
      setEditingColor(undefined);
      toast.success("Group updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: Id<"groups">) {
    try {
      const result = await removeGroup({ id });
      toast.success(
        result.changedTransactions
          ? `Group deleted. ${result.changedTransactions} transactions changed to no group.`
          : "Group deleted",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  function startEditing(group: NonNullable<typeof groups>[number]) {
    setEditingId(group._id);
    setEditingName(group.name);
    setEditingColor(group.color);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Groups</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Groups</DialogTitle>
          <DialogDescription>
            Groups act as tags. Deleted groups move transactions to no group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="new-group">New group</Label>
            <div className="flex gap-2">
              <Input
                id="new-group"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Group name"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && name.trim()) {
                    void handleCreate();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleCreate}
                disabled={!name.trim() || isSaving}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            <ColorPickerField
              id="new-group-color"
              value={color}
              onChange={setColor}
            />
          </div>

          <div className="rounded-md border">
            <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">
              <span>Groups</span>
              <Badge variant="secondary">{groups?.length ?? 0}</Badge>
            </div>
            <div className="divide-y">
              {(groups ?? []).map((group) => (
                <div
                  key={group._id}
                  className="flex min-h-12 cursor-pointer flex-col gap-3 px-3 py-2 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => {
                    if (editingId !== group._id) {
                      startEditing(group);
                    }
                  }}
                >
                  {editingId === group._id ? (
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
                        id={`${group._id}-color`}
                        label="Group color"
                        value={editingColor}
                        onChange={setEditingColor}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center gap-2">
                      {group.color ? (
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                      ) : null}
                      <span className="text-sm">{group.name}</span>
                    </div>
                  )}
                  <div
                    className="flex items-center gap-1"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    {editingId === group._id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleUpdate}
                          disabled={!editingName.trim() || isSaving}
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
                        onClick={() => startEditing(group)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label="Delete">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete group?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Existing transactions in this group will be changed
                            to no group.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              void handleDelete(group._id);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {groups?.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No groups yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
