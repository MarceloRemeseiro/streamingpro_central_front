import { FC } from 'react';
import CopyButton from './CopyButton';

interface OutputDefaultProps {
  streamId: string;
}

const OutputDefault: FC<OutputDefaultProps> = ({ streamId }) => {
  const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL || '';
  const port = process.env.NEXT_PUBLIC_RESTREAMER_PORT || '6000';
  const cleanStreamId = streamId.replace('.stream', '').replace(',mode:request', '');

  const outputs = [
    {
      label: 'SRT',
      url: `srt://${baseUrl}:${port}/?mode=caller&transtype=live&streamid=${cleanStreamId},mode:request`
    },
    {
      label: 'RTMP',
      url: `rtmp://${baseUrl}/${cleanStreamId}.stream`
    },
    {
      label: 'HLS',
      url: `https://${baseUrl}/memfs/${cleanStreamId}.m3u8`
    },
    {
      label: 'HTML',
      url: `https://${baseUrl}/${cleanStreamId}.html`
    }
  ];

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Outputs por defecto
      </h3>
      
      <div className="space-y-4">
        {outputs.map(({ label, url }) => (
          <div key={label} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="min-w-0 flex-1 mr-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                {label}
              </span>
              <p className="text-gray-900 dark:text-white break-all">{url}</p>
            </div>
            <div className="flex-shrink-0">
              <CopyButton text={url} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutputDefault; 