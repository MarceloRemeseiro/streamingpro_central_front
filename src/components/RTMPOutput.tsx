import { FC } from 'react';
import { OutputProcess } from '@/types/processTypes';
import CopyButton from './CopyButton';

interface RTMPOutputProps {
  output: OutputProcess;
}

const RTMPOutput: FC<RTMPOutputProps> = ({ output }) => {
  const name = output.metadata?.['restreamer-ui']?.name || 'Output sin nombre';
  const address = output.config?.output?.[0]?.address || '';
  const streamKey = output.reference + '.stream';
  const url = address.split('/').slice(0, -1).join('/');

  return (
    <div className="p-3 bg-purple-100/60 dark:bg-purple-900/30 rounded-lg border border-purple-300 dark:border-purple-700">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">
          {name}
        </h4>
        <span className={`
          px-1.5 py-0.5 text-xs rounded-full
          ${output.state?.exec === 'running' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}
        `}>
          {output.state?.exec || 'Desconocido'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">URL</span>
            <p className="text-purple-900 dark:text-purple-100 break-all text-xs">
              {url}
            </p>
          </div>
          <div className="flex-shrink-0">
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Stream Key</span>
            <p className="text-purple-900 dark:text-purple-100 break-all text-xs">
              {streamKey}
            </p>
          </div>
          <div className="flex-shrink-0">
          </div>
        </div>
      </div>
    </div>
  );
};

export default RTMPOutput; 