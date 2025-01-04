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
      fps?: 23.98 | 24 | 25 | 29.97 | 30 | 59.94 | 60;
      codec?: string;
      url?: string;
      bitrate_kbps?: number;
      format?: string;
    }>;
  }>;
}

interface StateProgress {
  inputs: Array<{
    address: string;
    codec?: string;
    width?: number;
    height?: number;
    fps?: number;
    format?: string;
    type?: string;
  }>;
  outputs: any[];
  frame: number;
  fps: number;
  bitrate_kbit: number;
  speed: number;
}

export interface Process extends BaseProcess {
  metadata?: {
    'restreamer-ui'?: RestreamerUI;
  };
  state?: {
    order?: string;
    exec?: string;
    runtime_seconds?: number;
    reconnect_seconds?: number;
    last_logline?: string;
    progress?: StateProgress;
    memory_bytes?: number;
    cpu_usage?: number;
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

export interface CreateProcessInput {
  type: 'rtmp' | 'srt';
  name: string;
  description?: string;
  port?: number;
  mode?: string;
  latency?: number;
  passphrase?: string;
}

export interface ProcessConfig {
  autostart: boolean;
  id: string;
  input: {
    address: string;
    options: {
      analyzeduration: number;
      probesize: number;
    }
  };
  limits: {
    cpu_usage: number;
    memory_mbytes: number;
    waitfor_seconds: number;
  };
  options: {
    input: {
      hwaccel: string;
    };
    output: {
      hls: {
        cleanup: boolean;
        master_playlist: boolean;
        segment_duration: number;
        version: number;
      }
    }
  };
  output: {
    rtmp: {
      address: string;
    };
    srt: {
      address: string;
    }
  };
  reconnect: {
    delay: number;
    maxAttempts: number;
  };
  reference: string;
  type: string;
} 