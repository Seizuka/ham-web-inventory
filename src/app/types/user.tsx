import type { Role as _Role } from "../../../config/roles";

export type User = {
  id: string;
  email: string;
  role: _Role | string; // pakai string jika role string
  avatarUrl?: string | null;
};

export type Role = _Role;
