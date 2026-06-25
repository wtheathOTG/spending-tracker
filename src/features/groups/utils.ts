import type { Id } from "@convex/_generated/dataModel";
import type { Group, GroupOption } from "./types";

export const NO_GROUP_VALUE = "__no_group__";
export const ALL_GROUPS_VALUE = "__all_groups__";

export function getNoGroupOption(): GroupOption {
  return {
    id: null,
    name: "No group",
  };
}

export function withNoGroup(groups: Group[] | undefined) {
  const stored = (groups ?? [])
    .map<GroupOption>((group) => ({
      id: group._id,
      name: group.name,
      color: group.color,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [getNoGroupOption(), ...stored];
}

export function groupIdToSelectValue(id: Id<"groups"> | null) {
  return id ?? NO_GROUP_VALUE;
}

export function selectValueToGroupId(value: string) {
  return value === NO_GROUP_VALUE ? null : (value as Id<"groups">);
}
