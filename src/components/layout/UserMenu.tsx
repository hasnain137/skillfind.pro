'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export function UserMenu() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-[#7C7373] hover:text-[#333333] transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4FD8] transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Dashboard Link */}
      <Link
        href={user.publicMetadata?.role === 'PROFESSIONAL' ? '/pro' : '/client'}
        className="text-sm font-medium text-[#7C7373] hover:text-[#333333] transition-colors"
      >
        Dashboard
      </Link>

      {/* Clerk User Button with custom appearance */}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
            userButtonPopoverCard: "rounded-xl border border-[#E5E7EB] shadow-lg",
            userButtonPopoverActionButton: "hover:bg-[#F3F4F6]",
            userButtonPopoverActionButtonText: "text-[#333333]",
            userButtonPopoverFooter: "hidden",
          },
        }}
        afterSignOutUrl="/"
      />
    </div>
  );
}
