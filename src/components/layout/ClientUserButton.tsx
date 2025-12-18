"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function ClientUserButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  return <UserButton afterSignOutUrl="/" />;
}
