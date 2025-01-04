import { Process as BaseProcess } from './restreamer';

interface RestreamerUI {
  meta?: {
    name?: string;
    description?: string;
  };
  name?: string;
  sources?: Array<{
    streams: Array<{
      type: string;
      width?: number;
      height?: number;
      fps?: number;
      codec?: string;
      url?: string;
      bitrate_kbps?: number;
      format?: string;
    }>;
  }>;
}

export interface Process extends BaseProcess {
  metadata?: {
    'restreamer-ui'?: RestreamerUI;
  };
}

export type InputType = 'srt' | 'rtmp';

export interface InputProcess extends Process {
  outputs: OutputProcess[];
  inputType: InputType;
  streamName: string;
}

export interface OutputProcess extends Process {
  parentId: string;
} 