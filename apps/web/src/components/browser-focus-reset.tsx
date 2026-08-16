"use client";

import { useEffect } from "react";

export function BrowserFocusReset() {
  useEffect(() => {
    function clearRestoredControlFocus(event: KeyboardEvent) {
      if (event.key !== "F11" && event.key !== "F12") {
        return;
      }

      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement
        && activeElement.matches("a, button, summary")
      ) {
        activeElement.blur();
      }
    }

    window.addEventListener("keydown", clearRestoredControlFocus, true);
    return () => window.removeEventListener("keydown", clearRestoredControlFocus, true);
  }, []);

  return null;
}
