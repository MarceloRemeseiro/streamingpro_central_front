'use client';

import { FC, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { OutputProcess } from '@/types/processTypes';
import { outputService } from '@/services/outputService';
import Modal from '../ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface EditSRTOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  output: OutputProcess;
  onUpdated?: () => void;
}

const EditSRTOutputModal: FC<EditSRTOutputModalProps> = ({
  isOpen,
  onClose,
  output,
  onUpdated
}) => {
  const [name, setName] = useState(output.metadata?.["restreamer-ui"]?.name || '');
  const [url, setUrl] = useState('');
  const [port, setPort] = useState('');
  const [latency, setLatency] = useState('');
  const [srtStreamId, setSrtStreamId] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Extraer los valores iniciales del output
  useState(() => {
    const address = output.config?.output?.[0]?.address || '';
    try {
      const url = new URL(address);
      setUrl(url.hostname);
      setPort(url.port);
      
      // Extraer parámetros de la URL
      const params = new URLSearchParams(url.search);
      setLatency(params.get('latency') || '');
      setSrtStreamId(params.get('streamid') || '');
      setPassphrase(params.get('passphrase') || '');
    } catch (error) {
      console.error('Error parsing SRT URL:', error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await outputService.updateSRTOutput(output.id, {
        type: 'srt',
        name,
        url,
        port,
        latency,
        srtStreamId,
        passphrase,
        streamId: output.reference
      });

      onUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error updating SRT output:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el output');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-text dark:text-text-dark">
        Edit SRT Output
      </Dialog.Title>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="space-y-4">
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Output name"
            protocol="srt"
            disabled
          />

          <Input
            label="URL"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="SRT server URL"
            protocol="srt"
            required
          />

          <Input
            label="Port"
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="SRT server port"
            protocol="srt"
            required
          />

          <Input
            label="Latency"
            type="text"
            value={latency}
            onChange={(e) => setLatency(e.target.value)}
            placeholder="Latency in milliseconds"
            protocol="srt"
            required
          />

          <Input
            label="Stream ID (optional)"
            type="text"
            value={srtStreamId}
            onChange={(e) => setSrtStreamId(e.target.value)}
            placeholder="Stream ID"
            protocol="srt"
          />

          <Input
            label="Passphrase (optional)"
            type="text"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Connection password"
            protocol="srt"
          />
        </div>

        {error && (
          <div className="mt-4 text-sm text-error dark:text-error-dark">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Saving..."
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSRTOutputModal; 