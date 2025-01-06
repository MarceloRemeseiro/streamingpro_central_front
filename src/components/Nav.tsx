import Link from "next/link";
import { 
  DevicePhoneMobileIcon, 
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import LogoutButton from "@/components/LogoutButton";

export default function Nav() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              StreamingPro
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/devices"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <DevicePhoneMobileIcon className="h-5 w-5" />
              <span>Dispositivos</span>
            </Link>

            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Crear Input</span>
            </Link>

            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 