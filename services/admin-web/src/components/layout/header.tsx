"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import type { User as AuthUser } from "next-auth";

interface HeaderProps {
  user?: AuthUser;
}

export function Header({ user }: HeaderProps) {
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Proceed with sign-out even if revocation fails
    }
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="lg:hidden">
          <span className="text-xl font-bold text-slate-900">Junpa</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {user?.name}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
