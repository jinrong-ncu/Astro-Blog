import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

const getStoredTheme = (): Theme => {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  }

  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
};

const supportsThemeTransition = () =>
  "startViewTransition" in document &&
  window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : getStoredTheme());
  }, []);

  const toggleTheme = async (event: ReactMouseEvent<HTMLButtonElement>) => {
    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme: Theme = isDark ? "light" : "dark";

    setTheme(nextTheme);

    if (!supportsThemeTransition()) {
      applyTheme(nextTheme);
      return;
    }

    const { clientX: x, clientY: y } = event;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];

    const root = document.documentElement;
    const startViewTransition = (document as ViewTransitionDocument).startViewTransition;

    root.classList.add("theme-transitioning");
    const transition = startViewTransition?.call(document, () => applyTheme(nextTheme));

    if (!transition) {
      root.classList.remove("theme-transitioning");
      return;
    }

    try {
      await transition.ready;

      root.animate(
        { clipPath: nextTheme === "dark" ? clipPath.toReversed() : clipPath },
        {
          duration: 360,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
          pseudoElement: `::view-transition-${nextTheme === "dark" ? "old" : "new"}(root)`,
        },
      );
    } finally {
      await transition.finished;
      root.classList.remove("theme-transitioning");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-900/5 dark:hover:bg-white/10 transition-colors focus:outline-none"
      aria-label="Toggle theme"
      aria-pressed={theme === "dark"}
    >
      <Sun className="absolute h-5 w-5 rotate-0 scale-100 opacity-100 transition-all duration-300 dark:rotate-90 dark:scale-0 dark:opacity-0" />
      <Moon className="absolute h-5 w-5 -rotate-90 scale-0 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100" />
    </button>
  );
}
