"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { PALETTE } from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface UserMenuProps {
  displayName: string;
  initial: string;
  email?: string | null;
  onLogout?: () => void;
}

export function UserMenu({
  displayName,
  initial,
  email,
  onLogout,
}: UserMenuProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors"
        style={{ background: "rgba(255,255,255,0.55)" }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{ background: PALETTE.azure, color: PALETTE.white }}
        >
          {initial}
        </span>
        <span
          className="text-sm font-medium max-w-[100px] truncate hidden sm:inline"
          style={{ color: PALETTE.navy }}
        >
          {displayName}
        </span>
        <ChevronDown size={14} style={{ color: PALETTE.azure }} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 rounded-xl py-2 z-50 glass-rivly-strong shadow-lg"
        >
          {email && (
            <p
              className="px-4 py-2 text-xs truncate border-b border-white/40"
              style={{ color: "#5C7E92" }}
            >
              {email}
            </p>
          )}
          <Link
            href="/pro"
            role="menuitem"
            className="block px-4 py-2 text-sm hover:bg-white/40"
            style={{ color: PALETTE.navy }}
            onClick={() => setOpen(false)}
          >
            {t.pro.forPros}
          </Link>
          {onLogout && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/40"
              style={{ color: PALETTE.navy }}
            >
              <LogOut size={14} />
              {t.auth.logout}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
