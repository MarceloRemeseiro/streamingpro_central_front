"use client";

import { useEffect, useState, useCallback } from "react";
import { InputProcess } from "@/types/processTypes";
import VideoPlayer from "@/components/processCard/VideoPlayer";
import OutputDefault from "@/components/processCard/OutputDefault";
import RTMPConnection from "@/components/processCard/RTMPConnection";
import SRTConnection from "@/components/processCard/SRTConnection";
import CustomOutputs from "@/components/processCard/CustomOutputs";
import PacketLossStats from "@/components/processCard/PacketLossStats";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import RTMPOutput from "@/components/processOutputs/RTMPOutput";
import SRTOutput from "@/components/processOutputs/SRTOutput";

interface InputDetailProps {
  id: string;
}

export default function InputDetail({ id }: InputDetailProps) {
  const [input, setInput] = useState<InputProcess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInput = useCallback(async () => {
    try {
      const response = await fetch(`/api/process/${id}/input`);
      if (!response.ok) {
        throw new Error("Error al cargar el input");
      }
      const data = await response.json();
      setInput(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching input:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInput();
    const interval = setInterval(fetchInput, 1000);
    return () => clearInterval(interval);
  }, [fetchInput]);

  const handleProcessUpdated = async () => {
    const scrollPosition = window.scrollY;
    await fetchInput();
    requestAnimationFrame(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'instant'
      });
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary-dark"></div>
      </div>
    );
  }

  if (error || !input) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-error dark:text-error-dark">
          {error || "Input no encontrado"}
        </div>
      </div>
    );
  }

  const getHlsUrl = () => {
    if (!input?.streamName) return "";
    const streamName = input.streamName.replace(".stream", "");
    return `http://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL}/memfs/${streamName}.m3u8`;
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-nav-text dark:text-nav-text-dark hover:text-nav-hover dark:hover:text-nav-hover-dark transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back</span>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-text dark:text-text-dark">
              {input.metadata?.["restreamer-ui"]?.meta?.name || "Input sin nombre"}
            </h1>
            <span
              className={`
                px-3 py-1 text-sm rounded-full
                ${
                  input.state?.exec === "running"
                    ? "bg-success-light dark:bg-success-dark text-success-dark dark:text-success-light"
                    : "bg-error-light dark:bg-error-dark text-error-dark dark:text-error-light"
                }
              `}
            >
              {input.state?.exec || "Desconocido"}
            </span>
            {input.state?.exec === "running" && <PacketLossStats input={input} />}
          </div>
          <CustomOutputs
            streamId={input.streamName}
            onOutputCreated={handleProcessUpdated}
          />
        </div>
        <p className="text-text-muted dark:text-text-muted-dark">
          {input.metadata?.["restreamer-ui"]?.meta?.description || "Sin descripción"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-lg shadow-sm">
            <VideoPlayer
              url={getHlsUrl()}
              isRunning={input.state?.exec === "running"}
              stats={input}
            />
          </div>

          <div className="mt-6 space-y-6">
            {input.inputType === "rtmp" && <RTMPConnection input={input} />}
            {input.inputType === "srt" && <SRTConnection input={input} />}

            <OutputDefault streamId={input.streamName} processId={input.id} />
          </div>
        </div>

        <div>
          <div className="space-y-4">
            {[...input.outputs]
              .sort((a, b) => {
                const nameA = a.metadata?.["restreamer-ui"]?.name || "";
                const nameB = b.metadata?.["restreamer-ui"]?.name || "";
                return nameA.localeCompare(nameB);
              })
              .map((output) => {
                if (output.id.includes(":egress:rtmp:")) {
                  return (
                    <RTMPOutput
                      key={output.id}
                      output={output}
                      onUpdated={handleProcessUpdated}
                    />
                  );
                } else if (output.id.includes(":egress:srt:")) {
                  return (
                    <SRTOutput
                      key={output.id}
                      output={output}
                      onUpdated={handleProcessUpdated}
                    />
                  );
                }
                return null;
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
