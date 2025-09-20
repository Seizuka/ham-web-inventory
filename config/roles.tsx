export type Role = "superadmin" | "admin_inventory" | "user";

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN_INVENTORY: "admin_inventory",
  USER: "user",
} as const;
