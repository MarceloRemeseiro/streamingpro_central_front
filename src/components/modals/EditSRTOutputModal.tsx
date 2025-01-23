'use client';

import { FC, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { OutputProcess } from '@/types/processTypes';
import { outputService } from '@/services/outputService';
import Modal from '../Modal';
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
        Editar Output SRT
      </Dialog.Title>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="space-y-4">
          <Input
            label="Nombre"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del output"
            protocol="srt"
            disabled
          />

          <Input
            label="URL"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL del servidor SRT"
            protocol="srt"
            required
          />

          <Input
            label="Puerto"
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="Puerto del servidor"
            protocol="srt"
            required
          />

          <Input
            label="Latencia"
            type="text"
            value={latency}
            onChange={(e) => setLatency(e.target.value)}
            placeholder="Latencia en milisegundos"
            protocol="srt"
            required
          />

          <Input
            label="Stream ID (opcional)"
            type="text"
            value={srtStreamId}
            onChange={(e) => setSrtStreamId(e.target.value)}
            placeholder="ID del stream"
            protocol="srt"
          />

          <Input
            label="Passphrase (opcional)"
            type="text"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Contraseña de conexión"
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
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Guardando..."
          >
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSRTOutputModal; 