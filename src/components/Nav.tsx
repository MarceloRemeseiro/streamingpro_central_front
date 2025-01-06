'use client';

import Link from "next/link";
import { 
  DevicePhoneMobileIcon, 
  PlusCircleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import LogoutButton from "@/components/LogoutButton";
import { useState } from "react";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      href: "/devices",
      icon: DevicePhoneMobileIcon,
      label: "Dispositivos"
    },
    {
      href: "/create",
      icon: PlusCircleIcon,
      label: "Crear Input"
    }
  ];

  return (
    <nav className="bg-nav-background shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-text-primary">
              StreamingPro
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-nav-text hover:text-nav-hover transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <LogoutButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-nav-text hover:text-nav-hover"
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
        <div className="px-4 pt-2 pb-3 space-y-1 border-t border-nav-border">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 text-base font-medium text-nav-text hover:text-nav-hover transition-colors rounded-md"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="px-4 py-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 