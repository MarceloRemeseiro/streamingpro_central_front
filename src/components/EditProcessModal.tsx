'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { InputProcess } from '@/types/processTypes';

interface EditProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: InputProcess;
  onProcessUpdated: () => void;
}

const EditProcessModal = ({ isOpen, onClose, process, onProcessUpdated }: EditProcessModalProps) => {
  const [name, setName] = useState(process.metadata?.['restreamer-ui']?.meta?.name || '');
  const [description, setDescription] = useState(process.metadata?.['restreamer-ui']?.meta?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/process/${process.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el proceso');
      }

      onProcessUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating process:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card-background dark:bg-card-background-dark p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-semibold text-text dark:text-text-dark">
                  Editar Proceso
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2 block w-full rounded-lg border border-border dark:border-border-dark bg-card-background dark:bg-card-background-dark px-3 py-2 text-text dark:text-text-dark placeholder-text-muted dark:placeholder-text-muted-dark focus:border-primary dark:focus:border-primary-dark focus:outline-none focus:ring-primary dark:focus:ring-primary-dark sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-text-muted dark:text-text-muted-dark">
                        Descripción
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-2 block w-full rounded-lg border border-border dark:border-border-dark bg-card-background dark:bg-card-background-dark px-3 py-2 text-text dark:text-text-dark placeholder-text-muted dark:placeholder-text-muted-dark focus:border-primary dark:focus:border-primary-dark focus:outline-none focus:ring-primary dark:focus:ring-primary-dark sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-lg border border-border dark:border-border-dark bg-card-background dark:bg-card-background-dark px-4 py-2 text-sm font-medium text-text dark:text-text-dark hover:bg-info-background dark:hover:bg-info-background-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary dark:bg-primary-dark px-4 py-2 text-sm font-medium text-text-light hover:bg-primary-hover dark:hover:bg-primary-hover-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditProcessModal; 