'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  /* DevicePhoneMobileIcon, */ 
  PlusCircleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import LogoutButton from "@/components/LogoutButton";
import { useState } from "react";
import { SystemMetrics } from "./SystemMetrics";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";



export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
   /*  {
      href: "/devices",
      icon: DevicePhoneMobileIcon,
      label: "Dispositivos"
    }, */
    {
      href: "/create",
      icon: PlusCircleIcon,
      label: "Crear Input"
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
          <div className="hidden md:flex items-center gap-4">
            <SystemMetrics />
            {menuItems.map((item) => (
              <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-nav-text dark:text-nav-text-dark hover:text-nav-hover dark:hover:text-nav-hover-dark transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
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
          ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}
          overflow-hidden
        `}
      >
        <div className="px-4 pt-2 pb-3 space-y-1 border-t border-nav-border dark:border-nav-border-dark">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 text-base font-medium text-nav-text dark:text-nav-text-dark hover:text-nav-hover dark:hover:text-nav-hover-dark transition-colors rounded-md"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="px-4 py-2">
            <SystemMetrics />
            <div className="flex items-center gap-2 mt-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 