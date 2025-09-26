import type { Role as _Role } from "../../../config/roles";

export type User = {
  id: string;
  name: string;
  email: string;
  role: _Role;
  avatarUrl?: string;
};

export type Role = _Role; // <--- EXPORT Role JUGA!
