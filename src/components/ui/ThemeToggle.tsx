'use client';

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch('/api/theme');
        const data = await response.json();
        setTheme(data.theme);
        document.documentElement.classList.toggle("dark", data.theme === "dark");
      } catch (error) {
        console.error('Error fetching theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();

    // Escuchar cambios en la preferencia del sistema solo si no hay tema guardado
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = async (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      await updateTheme(newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const updateTheme = async (newTheme: "light" | "dark") => {
    try {
      await fetch('/api/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: newTheme }),
      });
      
      setTheme(newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    updateTheme(newTheme);
  };

  if (isLoading) {
    return <div className="w-9 h-9"></div>; // Placeholder mientras carga
  }

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