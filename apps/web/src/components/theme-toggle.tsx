"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { IconButton } from "./button";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = window.localStorage.getItem("cph-theme");
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("cph-theme", nextTheme);
  }

  const dark = theme === "dark";
  return (
    <IconButton
      aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
      onClick={toggleTheme}
    >
      {dark
        ? <Sun aria-hidden="true" size={18} />
        : <Moon aria-hidden="true" size={18} />}
    </IconButton>
  );
}
