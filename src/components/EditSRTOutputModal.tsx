import { FC, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { OutputProcess } from '@/types/processTypes';
import { outputService } from '@/services/outputService';
import Modal from './Modal';

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
    } catch (error) {
      console.error('Error updating SRT output:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el output');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-text-primary">
        Editar Output SRT
      </Dialog.Title>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-muted">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md 
              bg-card-background text-text-primary
              focus:ring-2 focus:ring-protocol-srt-border"                   
              disabled
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-text-muted">
              URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md 
              bg-card-background text-text-primary
              focus:ring-2 focus:ring-protocol-srt-border"                   
              required
            />
          </div>

          <div>
            <label htmlFor="port" className="block text-sm font-medium text-text-muted">
              Puerto
            </label>
            <input
              type="text"
              id="port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md 
              bg-card-background text-text-primary
              focus:ring-2 focus:ring-protocol-srt-border"                   
              required
            />
          </div>

          <div>
            <label htmlFor="latency" className="block text-sm font-medium text-text-muted">
              Latencia
            </label>
            <input
              type="text"
              id="latency"
              value={latency}
              onChange={(e) => setLatency(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md 
              bg-card-background text-text-primary
              focus:ring-2 focus:ring-protocol-srt-border"                   
              required
            />
          </div>

          <div>
            <label htmlFor="streamId" className="block text-sm font-medium text-text-muted">
              Stream ID (opcional)
            </label>
            <input
              type="text"
              id="streamId"
              value={srtStreamId}
              onChange={(e) => setSrtStreamId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md 
              bg-card-background text-text-primary
              focus:ring-2 focus:ring-protocol-srt-border"                 
            />
          </div>

          <div>
            <label htmlFor="passphrase" className="block text-sm font-medium text-text-muted">
              Passphrase (opcional)
            </label>
            <input
              type="text"
              id="passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md 
              bg-card-background text-text-primary
              focus:ring-2 focus:ring-protocol-srt-border"                 
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-error">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-card-background px-4 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-info-background focus:outline-none focus:ring-2 focus:ring-protocol-srt-border focus:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-text-light hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSRTOutputModal; 