import { FC, useState, Fragment } from 'react';
import { Dialog, Tab, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/utils/classNames';
import { OutputService } from '@/services/outputService';

interface CreateOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
  onOutputCreated?: () => void;
}

interface SRTOutputConfig {
  type: 'srt';
  streamId: string;
  name: string;
  url: string;
  port: string;
  latency: string;
  srtStreamId?: string;
  passphrase?: string;
}

const CreateOutputModal: FC<CreateOutputModalProps> = ({
  isOpen,
  onClose,
  streamId,
  onOutputCreated
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const outputService = OutputService.getInstance();

  // RTMP Form State
  const [rtmpName, setRtmpName] = useState('');
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [rtmpStreamKey, setRtmpStreamKey] = useState('');

  // SRT Form State
  const [srtName, setSrtName] = useState('');
  const [srtUrl, setSrtUrl] = useState('');
  const [srtPort, setSrtPort] = useState('');
  const [srtLatency, setSrtLatency] = useState('200');
  const [srtStreamId, setSrtStreamId] = useState('');
  const [srtPassphrase, setSrtPassphrase] = useState('');

  const handleCreateRTMP = async () => {
    setIsLoading(true);
    try {
      const processedUrl = rtmpUrl.startsWith('rtmp://') ? rtmpUrl : `rtmp://${rtmpUrl}`;
      
      await outputService.createOutput({
        type: 'rtmp',
        streamId,
        name: rtmpName,
        url: processedUrl,
        streamKey: rtmpStreamKey,
      });

      onOutputCreated?.();
      onClose();
    } catch (error: unknown) {
      console.error('Error creating RTMP output:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSRT = async () => {
    setIsLoading(true);
    try {
      const processedUrl = srtUrl.startsWith('srt://') ? srtUrl.replace('srt://', '') : srtUrl;
      
      const outputConfig: SRTOutputConfig = {
        type: 'srt',
        streamId,
        name: srtName,
        url: processedUrl,
        port: srtPort,
        latency: srtLatency,
      };

      if (srtStreamId.trim()) {
        outputConfig.srtStreamId = srtStreamId;
      }

      if (srtPassphrase.trim()) {
        outputConfig.passphrase = srtPassphrase;
      }

      await outputService.createOutput(outputConfig);

      onOutputCreated?.();
      onClose();
    } catch (error: unknown) {
      console.error('Error creating SRT output:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-card-background dark:bg-card-background-dark p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium text-text dark:text-text-dark">
                    Crear Nuevo Output
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                  <Tab.List className="flex space-x-1 rounded-xl bg-info-background dark:bg-info-background-dark p-1 mb-4">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                          'ring-white/60 ring-offset-2 ring-offset-primary focus:outline-none',
                          selected
                            ? 'bg-protocol-rtmp-background dark:bg-protocol-rtmp-background-dark text-protocol-rtmp-text dark:text-protocol-rtmp-text-dark shadow'
                            : 'text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark'
                        )
                      }
                    >
                      RTMP
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                          'ring-white/60 ring-offset-2 ring-offset-primary focus:outline-none',
                          selected
                            ? 'bg-protocol-srt-background dark:bg-protocol-srt-background-dark text-protocol-srt-text dark:text-protocol-srt-text-dark shadow'
                            : 'text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark'
                        )
                      }
                    >
                      SRT
                    </Tab>
                  </Tab.List>

                  <Tab.Panels>
                    <Tab.Panel className=" ">
                      <div className="space-y-4 p-4">
                        <div>
                          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={rtmpName}
                            onChange={(e) => setRtmpName(e.target.value)}
                            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md 
                            bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark
                            focus:ring-2 focus:ring-protocol-rtmp-border dark:focus:ring-protocol-rtmp-border-dark"
                            placeholder="Nombre del output"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
                            URL
                          </label>
                          <input
                            type="text"
                            value={rtmpUrl}
                            onChange={(e) => setRtmpUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md 
                            bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark
                            focus:ring-2 focus:ring-protocol-rtmp-border dark:focus:ring-protocol-rtmp-border-dark"
                            placeholder="ejemplo.com/live o rtmp://ejemplo.com/live"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
                            Stream Key
                          </label>
                          <input
                            type="text"
                            value={rtmpStreamKey}
                            onChange={(e) => setRtmpStreamKey(e.target.value)}
                            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md 
                            bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark
                            focus:ring-2 focus:ring-protocol-rtmp-border dark:focus:ring-protocol-rtmp-border-dark"
                            placeholder="Stream key"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-text dark:text-text-dark hover:bg-info-background dark:hover:bg-info-background-dark rounded-md transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateRTMP}
                            disabled={isLoading || !rtmpName || !rtmpUrl || !rtmpStreamKey}
                            className="px-4 py-2 text-sm font-medium text-text-light bg-protocol-rtmp-background dark:bg-protocol-rtmp-background-dark hover:bg-protocol-rtmp dark:hover:bg-protocol-rtmp-dark disabled:opacity-50 rounded-md transition-colors"
                          >
                            {isLoading ? 'Creando...' : 'Crear Output RTMP'}
                          </button>
                        </div>
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div className="space-y-4 p-4">
                        <div>
                          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={srtName}
                            onChange={(e) => setSrtName(e.target.value)}
                            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md 
                            bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark
                            focus:ring-2 focus:ring-protocol-srt-border dark:focus:ring-protocol-srt-border-dark"
                            placeholder="Nombre del output"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
                            URL
                          </label>
                          <input
                            type="text"
                            value={srtUrl}
                            onChange={(e) => setSrtUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md 
                            bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark
                            focus:ring-2 focus:ring-protocol-srt-border dark:focus:ring-protocol-srt-border-dark"
                            placeholder="ejemplo.com o srt://ejemplo.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
                            Puerto
                          </label>
                          <input
                            type="text"
                            value={srtPort}
                            onChange={(e) => setSrtPort(e.target.value)}
                            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md 
                            bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark
                            focus:ring-2 focus:ring-protocol-srt-border dark:focus:ring-protocol-srt-border-dark"
                            placeholder="9000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
                            Latency (ms)
                          </label>
                          <input
                            type="number"
                            value={srtLatency}
                            onChange={(e) => setSrtLatency(e.target.value)}
                            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md 
                            bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark
                            focus:ring-2 focus:ring-protocol-srt-border dark:focus:ring-protocol-srt-border-dark"
                            placeholder="200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
                            Stream ID (opcional)
                          </label>
                          <input
                            type="text"
                            value={srtStreamId}
                            onChange={(e) => setSrtStreamId(e.target.value)}
                            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md 
                            bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark
                            focus:ring-2 focus:ring-protocol-srt-border dark:focus:ring-protocol-srt-border-dark"
                            placeholder="stream_id"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-muted dark:text-text-muted-dark mb-1">
                            Passphrase (opcional)
                          </label>
                          <input
                            type="text"
                            value={srtPassphrase}
                            onChange={(e) => setSrtPassphrase(e.target.value)}
                            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md 
                            bg-card-background dark:bg-card-background-dark text-text dark:text-text-dark
                            focus:ring-2 focus:ring-protocol-srt-border dark:focus:ring-protocol-srt-border-dark"
                            placeholder="Contraseña"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-text dark:text-text-dark hover:bg-info-background dark:hover:bg-info-background-dark rounded-md transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateSRT}
                            disabled={isLoading || !srtName || !srtUrl || !srtPort}
                            className="px-4 py-2 text-sm font-medium text-text-light bg-protocol-srt-background dark:bg-protocol-srt-background-dark hover:bg-protocol-srt dark:hover:bg-protocol-srt-dark disabled:opacity-50 rounded-md transition-colors"
                          >
                            {isLoading ? 'Creando...' : 'Crear Output SRT'}
                          </button>
                        </div>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateOutputModal; 