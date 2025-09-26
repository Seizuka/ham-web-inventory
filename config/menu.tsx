import { Role } from "./roles";
type MenuItem = {
  name: string;
  path: string;
  roles: Role[];
};

export const MENU_ITEMS: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", roles: ["superadmin", "admin_inventory", "user"] },
  { name: "Profile", path: "/profile", roles: ["superadmin", "admin_inventory", "user"] },
  { name: "List Barang", path: "/items", roles: ["superadmin", "admin_inventory"] },
  { name: "Request Barang", path: "/requests", roles: ["superadmin", "admin_inventory", "user"] },
  { name: "User", path: "/users", roles: ["superadmin"] },
];
