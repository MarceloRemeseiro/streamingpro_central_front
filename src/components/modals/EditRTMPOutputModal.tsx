import { FC, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { OutputProcess } from '@/types/processTypes';
import { outputService } from '@/services/outputService';
import Modal from '../ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface EditRTMPOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  output: OutputProcess;
  onUpdated?: () => void;
}

const EditRTMPOutputModal: FC<EditRTMPOutputModalProps> = ({
  isOpen,
  onClose,
  output,
  onUpdated
}) => {
  const [name, setName] = useState(output.metadata?.["restreamer-ui"]?.name || '');
  const [url, setUrl] = useState(output.config?.output?.[0]?.address || '');
  const [streamKey, setStreamKey] = useState(output.config?.output?.[0]?.options?.[13] || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await outputService.updateRTMPOutput(output.id, {
        type: 'rtmp',
        name,
        url,
        streamKey,
        streamId: output.reference
      });

      onUpdated?.();
    } catch (error) {
      console.error('Error updating RTMP output:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el output');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-text dark:text-text-dark">
        Editar Output RTMP
      </Dialog.Title>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="space-y-4">
          <Input
            label="Nombre"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del output"
            protocol="rtmp"
            disabled
          />

          <Input
            label="URL"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL del servidor RTMP"
            protocol="rtmp"
            required
          />

          <Input
            label="Stream Key"
            type="text"
            value={streamKey}
            onChange={(e) => setStreamKey(e.target.value)}
            placeholder="Clave de transmisión"
            protocol="rtmp"
            required
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

export default EditRTMPOutputModal; 