import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function DevicesPage() {
  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center gap-2 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver</span>
          </Link>
        </div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Dispositivos
      </h1>
      <div className="max-w-2xl mx-auto">
      </div>
    </div>
  );
} 