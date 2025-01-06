"use client";

import { useState } from "react";
import {
  CreateProcessInput,
  ProcessType
} from "@/types/createProcessTypes";
import { processService } from "@/services/process";


interface CreateProcessFormProps {
  onSuccess?: () => void;
}

export default function CreateProcessForm({ onSuccess }: CreateProcessFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProcessInput>({
    type: "rtmp",
    name: "",
    description: "",
  });

  const handleTypeChange = (type: ProcessType) => {
    setFormData((prev) => ({
      ...prev,
      type,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await processService.createProcess(formData);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating process:", error);
      setError(error instanceof Error ? error.message : "Error al crear el proceso");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error-light p-4 rounded-md">
          <p className="text-error">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Tipo de Conexión
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleTypeChange("rtmp")}
              className={`px-4 py-2 rounded-md ${
                formData.type === "rtmp"
                  ? "bg-protocol-rtmp-background text-protocol-rtmp-text"
                  : "bg-info-background text-text-muted"
              }`}
            >
              RTMP
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("srt")}
              className={`px-4 py-2 rounded-md ${
                formData.type === "srt"
                  ? "bg-protocol-srt-background text-protocol-srt-text"
                  : "bg-info-background text-text-muted"
              }`}
            >
              SRT
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-muted mb-2"
          >
            Nombre
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border border-border rounded-md 
                     bg-card-background text-text-primary
                     focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-text-muted mb-2"
          >
            Descripción
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-3 py-2 border border-border rounded-md 
                     bg-card-background text-text-primary
                     focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 rounded-md text-text-light
                     ${
                       isLoading
                         ? "bg-primary-light cursor-not-allowed"
                         : "bg-primary hover:bg-primary-hover"
                     }`}
          >
            {isLoading ? "Creando..." : "Crear Proceso"}
          </button>
        </div>
      </div>
    </form>
  );
}
