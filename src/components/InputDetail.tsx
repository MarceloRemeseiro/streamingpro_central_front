'use client';

import { useEffect, useState } from 'react';
import { InputProcess } from '@/types/processTypes';
import VideoPlayer from '@/components/VideoPlayer';
import OutputDefault from '@/components/OutputDefault';
import RTMPConnection from '@/components/RTMPConnection';
import SRTConnection from '@/components/SRTConnection';
import CustomOutputs from '@/components/CustomOutputs';
import StreamStats from '@/components/StreamStats';
import PacketLossStats from '@/components/PacketLossStats';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface InputDetailProps {
  id: string;
}

export default function InputDetail({ id }: InputDetailProps) {
  const [input, setInput] = useState<InputProcess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInput = async () => {
      try {
        const response = await fetch(`/api/process/${id}/input`);
        if (!response.ok) {
          throw new Error('Error al cargar el input');
        }
        const data = await response.json();
        setInput(data);
      } catch (error) {
        console.error('Error fetching input:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInput();
  }, [id]);

  const handleProcessUpdated = async () => {
    try {
      const response = await fetch(`/api/process/${id}/input`);
      if (!response.ok) {
        throw new Error('Error al actualizar el input');
      }
      const data = await response.json();
      setInput(data);
    } catch (error) {
      console.error('Error updating input:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !input) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">
          {error || 'Input no encontrado'}
        </div>
      </div>
    );
  }

  const getHlsUrl = () => {
    if (!input?.streamName) return '';
    const streamName = input.streamName.replace(".stream", "");
    return `http://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL}/memfs/${streamName}.m3u8`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {input.metadata?.["restreamer-ui"]?.meta?.name || "Input sin nombre"}
          </h1>
          <span
            className={`
              px-3 py-1 text-sm rounded-full
              ${
                input.state?.exec === "running"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
              }
            `}
          >
            {input.state?.exec || "Desconocido"}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {input.metadata?.["restreamer-ui"]?.meta?.description || "Sin descripción"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <VideoPlayer
              url={getHlsUrl()}
              isRunning={input.state?.exec === "running"}
              className="aspect-video w-full"
            />
          </div>

          <StreamStats input={input} />

          {input.state?.exec === "running" && (
            <PacketLossStats input={input} />
          )}

          {input.inputType === "rtmp" && <RTMPConnection input={input} />}
          {input.inputType === "srt" && <SRTConnection input={input} />}

          <OutputDefault streamId={input.streamName} />
        </div>

        <div className="space-y-6">
          <CustomOutputs
            streamId={input.streamName}
            onOutputCreated={handleProcessUpdated}
          />
        </div>
      </div>
    </div>
  );
} 