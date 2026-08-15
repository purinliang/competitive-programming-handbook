"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      remove: (widgetId: string) => void;
      render: (
        element: HTMLElement,
        options: {
          callback: (token: string) => void;
          "error-callback": () => void;
          sitekey: string;
          theme: "auto";
        },
      ) => string;
    };
  }
}

let scriptPromise: Promise<void> | undefined;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "true";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(), { once: true });
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function TurnstileWidget({
  onToken,
  siteKey,
}: {
  onToken: (token: string) => void;
  siteKey: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    let widgetId: string | undefined;
    loadTurnstile().then(() => {
      if (!active || !container.current || !window.turnstile) return;
      widgetId = window.turnstile.render(container.current, {
        callback: onToken,
        "error-callback": () => onToken(""),
        sitekey: siteKey,
        theme: "auto",
      });
    }).catch(() => onToken(""));
    return () => {
      active = false;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken, siteKey]);
  return <div className="turnstile-widget" ref={container} />;
}
