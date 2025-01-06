import { Suspense } from 'react';
import InputDetail from '@/components/InputDetail';

interface PageParams {
  id: string;
}

export default async function InputPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <InputDetail id={id} />
    </Suspense>
  );
} 