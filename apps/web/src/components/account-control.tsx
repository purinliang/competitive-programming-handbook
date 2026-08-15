"use client";

import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

interface AccountState {
  authConfigured: boolean;
  user: null | {
    name: string;
  };
}

export function AccountControl() {
  const [account, setAccount] = useState<AccountState>();

  useEffect(() => {
    let active = true;
    fetch("/api/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() as Promise<AccountState> : undefined)
      .then((result) => {
        if (active && result) setAccount(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!account?.authConfigured) {
    return <span className="account-control-placeholder" aria-hidden="true" />;
  }

  if (!account.user) {
    return (
      <button
        className="account-control"
        onClick={() => authClient.signIn.social({
          callbackURL: window.location.href,
          provider: "github",
        })}
        type="button"
      >
        <LogIn aria-hidden="true" size={15} />
        登录
      </button>
    );
  }

  return (
    <button
      className="account-control"
      onClick={async () => {
        await authClient.signOut();
        window.location.reload();
      }}
      title={`${account.user.name}，点击退出登录`}
      type="button"
    >
      <span>{account.user.name}</span>
      <LogOut aria-hidden="true" size={15} />
    </button>
  );
}
