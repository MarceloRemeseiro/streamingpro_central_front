'use client';

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Intentar recuperar el tema guardado del localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    }
    return "light";
  });

  useEffect(() => {
    // Si no hay tema guardado, usar la preferencia del sistema
    if (!localStorage.getItem('theme')) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
        localStorage.setItem('theme', 'dark');
      }
    } else {
      // Aplicar el tema guardado
      document.documentElement.classList.toggle("dark", theme === "dark");
    }

    // Escuchar cambios en la preferencia del sistema solo si no hay tema guardado
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", e.matches);
        localStorage.setItem('theme', newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-card dark:bg-card-dark hover:bg-primary/10 dark:hover:bg-primary-dark/20 transition-colors"
      aria-label="Cambiar tema"
    >
      {theme === "light" ? (
        <SunIcon className="h-5 w-5 text-primary dark:text-primary-light" />
      ) : (
        <MoonIcon className="h-5 w-5 text-primary dark:text-primary-light" />
      )}
    </button>
  );
} 