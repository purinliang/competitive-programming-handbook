"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const revealDelay = 350;

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timer = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const finish = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setVisible(false);
  }, []);

  const start = useCallback(() => {
    if (timer.current !== null || visible) {
      return;
    }
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setVisible(true);
    }, revealDelay);
  }, [visible]);

  useEffect(() => finish(), [finish, routeKey]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target?.href || target.target === "_blank" || target.hasAttribute("download")) {
        return;
      }

      const destination = new URL(target.href, window.location.href);
      if (destination.origin !== window.location.origin) {
        return;
      }
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) {
        return;
      }

      start();
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", start);
    };
  }, [start]);

  return visible ? <div className="navigation-progress" role="progressbar" aria-label="正在载入页面"><span /></div> : null;
}
