// src/components/layout/Navbar.tsx
import { auth } from "@clerk/nextjs/server";
import { NavbarContent } from "./NavbarContent";

export async function Navbar() {
  const { userId } = await auth();

  return <NavbarContent userId={userId} />;
}
