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
    } catch (error) {
      console.error('Error creating RTMP output:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSRT = async () => {
    setIsLoading(true);
    try {
      const processedUrl = srtUrl.startsWith('srt://') ? srtUrl.replace('srt://', '') : srtUrl;
      
      const outputConfig: any = {
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
    } catch (error) {
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                    Crear Nuevo Output
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                  <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1 mb-4">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                          'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
                          selected
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                        )
                      }
                    >
                      RTMP
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                          'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
                          selected
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={rtmpName}
                            onChange={(e) => setRtmpName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"                            placeholder="Nombre del output"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            URL
                          </label>
                          <input
                            type="text"
                            value={rtmpUrl}
                            onChange={(e) => setRtmpUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"                            placeholder="ejemplo.com/live o rtmp://ejemplo.com/live"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Stream Key
                          </label>
                          <input
                            type="text"
                            value={rtmpStreamKey}
                            onChange={(e) => setRtmpStreamKey(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"                            placeholder="Stream key"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateRTMP}
                            disabled={isLoading || !rtmpName || !rtmpUrl || !rtmpStreamKey}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-md transition-colors"
                          >
                            {isLoading ? 'Creando...' : 'Crear Output RTMP'}
                          </button>
                        </div>
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div className="space-y-4 p-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={srtName}
                            onChange={(e) => setSrtName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"                             placeholder="Nombre del output"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            URL
                          </label>
                          <input
                            type="text"
                            value={srtUrl}
                            onChange={(e) => setSrtUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"                            placeholder="ejemplo.com o srt://ejemplo.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Puerto
                          </label>
                          <input
                            type="text"
                            value={srtPort}
                            onChange={(e) => setSrtPort(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"                            placeholder="9000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Latency (ms)
                          </label>
                          <input
                            type="number"
                            value={srtLatency}
                            onChange={(e) => setSrtLatency(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"                            placeholder="200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Stream ID (opcional)
                          </label>
                          <input
                            type="text"
                            value={srtStreamId}
                            onChange={(e) => setSrtStreamId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"                            placeholder="stream_id"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Passphrase (opcional)
                          </label>
                          <input
                            type="text"
                            value={srtPassphrase}
                            onChange={(e) => setSrtPassphrase(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"                            placeholder="Contraseña"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateSRT}
                            disabled={isLoading || !srtName || !srtUrl || !srtPort}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
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