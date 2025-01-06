'use client';

import { ProcessList } from "@/components/ProcessList";
import { useState } from "react";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="container mx-auto py-8 px-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">INPUTS</h2>
      <ProcessList key={refreshKey} />
    </main>
  );
}
