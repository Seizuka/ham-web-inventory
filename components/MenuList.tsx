"use client";
import { useAuth } from "../contexts/AuthContext";
import { MENU_ITEMS } from "../config/menu";
import Link from "next/link";

export default function MenuList() {
  const { user } = useAuth();
  if (!user) return null;
  const menus = MENU_ITEMS.filter((item) => item.roles.includes(user.role));
  return (
    <ul className="space-y-2">
      {menus.map((item) => (
        <li key={item.name}>
          <Link href={item.path} className="block py-2 px-4 rounded hover:bg-gray-200">
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
