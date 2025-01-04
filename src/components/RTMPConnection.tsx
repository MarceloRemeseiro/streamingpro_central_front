import { InputProcess } from '@/types/processTypes';
import CopyButton from './CopyButton';

interface RTMPConnectionProps {
  input: InputProcess;
}

export default function RTMPConnection({ input }: RTMPConnectionProps) {
  const url = `rtmp://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL}`;
  const streamKey = input.streamName;
  const oneLine = `${url}/${streamKey}`;

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Información de conexión RTMP
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</span>
            <p className="text-gray-900 dark:text-white">{url}</p>
          </div>
          <CopyButton text={url} />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Stream Key</span>
            <p className="text-gray-900 dark:text-white">{streamKey}</p>
          </div>
          <CopyButton text={streamKey} />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">One-Line</span>
            <p className="text-gray-900 dark:text-white">{oneLine}</p>
          </div>
          <CopyButton text={oneLine} />
        </div>
      </div>
    </div>
  );
} 