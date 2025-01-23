"use client";

import { useState } from "react";
import {
  CreateProcessInput,
  ProcessType
} from "@/types/createProcessTypes";
import { processService } from "@/services/process";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from '@/components/ui/Button';

interface CreateProcessFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateProcessForm({ onSuccess, onCancel }: CreateProcessFormProps) {
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
        <div className="bg-error-light dark:bg-error-dark p-4 rounded-md">
          <p className="text-error dark:text-error-dark">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-2">
            Connection Type
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleTypeChange("rtmp")}
              className={`px-4 py-2 rounded-md ${
                formData.type === "rtmp"
                  ? "bg-protocol-rtmp-background dark:bg-protocol-rtmp-background-dark text-protocol-rtmp-text dark:text-text-light"
                  : "bg-info-background dark:bg-info-background-dark text-text-muted dark:text-text-muted-dark"
              }`}
            >
              RTMP
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("srt")}
              className={`px-4 py-2 rounded-md ${
                formData.type === "srt"
                  ? "bg-protocol-srt-background dark:bg-protocol-srt-background-dark text-protocol-srt-text dark:text-text-light"
                  : "bg-info-background dark:bg-info-background-dark text-text-muted dark:text-text-muted-dark"
              }`}
            >
              SRT
            </button>
          </div>
        </div>

        <Input
          label="Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Name"
          protocol={formData.type}
          required
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Description"
          protocol={formData.type}
        />

        <div className="mt-8 flex justify-end gap-3">
        
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Creating..."
          >
            Create
          </Button>
        </div>
      </div>
    </form>
  );
}
