import { FC } from 'react';
import { OutputProcess } from '@/types/processTypes';

interface SRTOutputProps {
  output: OutputProcess;
}

const SRTOutput: FC<SRTOutputProps> = ({ output }) => {
  const name = output.metadata?.['restreamer-ui']?.name || 'Output sin nombre';
  const address = output.config?.output?.[0]?.address || '';

  // Extraer información del address SRT
  const url = `srt:${address.split(':')[1].split('?')[0]}` || '';
  const port = address.split(':')[2].split('?')[0] || '';
  const params = new URLSearchParams(address.split('?')[1] || '');
  
  const streamId = params.get('streamid') || '';
  const latency = params.get('latency') || '';
  const mode = params.get('mode') || 'CALLER';
  const passphrase = params.get('passphrase') || 'No configurado';

  return (
    <div className="p-3 bg-blue-100/60 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
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

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="font-medium text-blue-700 dark:text-blue-300">URL</span>
          <p className="text-blue-900 dark:text-blue-100 break-all">
            {url}
          </p>
        </div>
        <div>
          <span className="font-medium text-blue-700 dark:text-blue-300">Puerto</span>
          <p className="text-blue-900 dark:text-blue-100">
            {port}
          </p>
        </div>
        <div>
          <span className="font-medium text-blue-700 dark:text-blue-300">Stream ID</span>
          <p className="text-blue-900 dark:text-blue-100 break-all">
            {streamId}
          </p>
        </div>
        <div>
          <span className="font-medium text-blue-700 dark:text-blue-300">Latency</span>
          <p className="text-blue-900 dark:text-blue-100">
            {latency}ms
          </p>
        </div>
        <div>
          <span className="font-medium text-blue-700 dark:text-blue-300">Mode</span>
          <p className="text-blue-900 dark:text-blue-100">
            {mode}
          </p>
        </div>
        <div>
          <span className="font-medium text-blue-700 dark:text-blue-300">Passphrase</span>
          <p className="text-blue-900 dark:text-blue-100">
            {passphrase}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SRTOutput; 