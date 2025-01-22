'use client';

import { ProcessList } from "@/components/ProcessList";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-6">INPUTS</h2>
      <ProcessList />
    </main>
  );
}
