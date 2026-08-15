"use client";

import { LogIn, LogOut } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

import { LoadingBar } from "./loading-bar";

interface AccountState {
  authConfigured: boolean;
  user: null | {
    email: string;
    image?: string | null;
    name: string;
    role: "admin" | "student";
  };
}

const ACCOUNT_SNAPSHOT_KEY = "handbook.account-snapshot.v1";

export function AccountControl() {
  const [account, setAccount] = useState<AccountState>({
    authConfigured: true,
    user: null,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    try {
      const snapshot = localStorage.getItem(ACCOUNT_SNAPSHOT_KEY);
      if (snapshot) {
        setAccount(JSON.parse(snapshot) as AccountState);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() as Promise<AccountState> : undefined)
      .then((result) => {
        if (!active || !result) return;

        setAccount(result);
        if (result.authConfigured) {
          localStorage.setItem(ACCOUNT_SNAPSHOT_KEY, JSON.stringify(result));
        } else {
          localStorage.removeItem(ACCOUNT_SNAPSHOT_KEY);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function dismissOnPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", dismissOnPointerDown);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnPointerDown);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [menuOpen]);

  if (!account.authConfigured) {
    return <span className="account-control-slot" aria-hidden="true" />;
  }

  if (!account.user) {
    return (
      <div className="account-control-slot">
        <LoadingBar active={pending} immediate />
        <button
          className="control-button account-login-button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            try {
              await authClient.signIn.social({
                callbackURL: window.location.href,
                provider: "github",
              });
            } finally {
              setPending(false);
            }
          }}
          type="button"
        >
          <LogIn aria-hidden="true" size={15} />
          登录
        </button>
      </div>
    );
  }

  const initial = Array.from(account.user.name.trim())[0]?.toUpperCase() ?? "?";

  return (
    <div className="account-control-slot" ref={menuRef}>
      <LoadingBar active={pending} immediate />
      <button
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={`${account.user.name}，打开账户菜单`}
        className="account-avatar-button"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span className="account-avatar-fallback" aria-hidden="true">{initial}</span>
        {account.user.image ? (
          <img
            alt=""
            className="account-avatar-image"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
            referrerPolicy="no-referrer"
            src={account.user.image}
          />
        ) : null}
      </button>

      {menuOpen ? (
        <div className="account-menu" role="menu" aria-label="账户菜单">
          <div className="account-menu-identity">
            <strong>{account.user.name}</strong>
            <span>{account.user.email}</span>
          </div>
          <button
            className="control-button account-menu-item"
            disabled={pending}
            onClick={async () => {
              setMenuOpen(false);
              setPending(true);
              try {
                await authClient.signOut();
                localStorage.setItem(ACCOUNT_SNAPSHOT_KEY, JSON.stringify({
                  authConfigured: true,
                  user: null,
                } satisfies AccountState));
                window.location.reload();
              } finally {
                setPending(false);
              }
            }}
            role="menuitem"
            type="button"
          >
            <LogOut aria-hidden="true" size={15} />
            退出登录
          </button>
        </div>
      ) : null}
    </div>
  );
}
