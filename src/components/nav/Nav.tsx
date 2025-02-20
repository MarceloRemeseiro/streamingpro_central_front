'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  VideoCameraIcon,
  PlusCircleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import LogoutButton from "@/components/login/LogoutButton";
import { useState } from "react";
import { SystemMetrics } from "./SystemMetrics";
import ThemeToggle from "../ui/ThemeToggle";
import Image from "next/image";



export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/create",
      icon: PlusCircleIcon,
      label: "Create"
    },
    {
      href: "/recordings",
      icon: VideoCameraIcon,
      label: "Media"
    }
    
  ];

  return (
    <nav className="bg-nav-background dark:bg-nav-background-dark border-b border-nav-border dark:border-nav-border-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="StreamingPro" width={40} height={40} />
                <span className="text-2xl font-bold text-primary dark:text-primary-light">
                  StreamingPro Central
                </span>
              </Link>
            </div>
         
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            <SystemMetrics />
            {menuItems.map((item) => (
              <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1 py-2 text-sm font-medium text-nav-text dark:text-nav-text-dark hover:text-nav-hover dark:hover:text-nav-hover-dark transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="px-1">{item.label}</span>
              </Link>
            ))}
            <LogoutButton />
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-nav-text dark:text-nav-text-dark hover:text-nav-hover dark:hover:text-nav-hover-dark"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`
          md:hidden
          transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          overflow-hidden bg-nav-background dark:bg-nav-background-dark
        `}
      >
        <div className="px-4 py-2 border-t border-nav-border dark:border-nav-border-dark">
          <div className="flex flex-col items-stretch space-y-2">
            {/* System Metrics en una línea */}
            <div className="flex justify-center">
              <SystemMetrics />
            </div>

            {/* Links del menú */}
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center gap-2 py-2 text-base font-medium text-nav-text dark:text-nav-text-dark hover:text-nav-hover dark:hover:text-nav-hover-dark transition-colors rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Línea divisoria */}
            <div className="border-t border-nav-border dark:border-nav-border-dark"></div>

            {/* Botones de tema y logout */}
            <div className="flex justify-center items-center gap-4">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 