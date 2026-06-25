"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useGroups() {
  return useQuery(api.groups.list, {});
}

export function useGroupMutations() {
  return {
    createGroup: useMutation(api.groups.create),
    updateGroup: useMutation(api.groups.update),
    removeGroup: useMutation(api.groups.remove),
  };
}
