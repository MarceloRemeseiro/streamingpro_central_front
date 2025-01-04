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

export interface VideoInput {
  id: string;
  address: string;
  index: number;
  stream: number;
  format: string;
  type: string;
  codec: string;
  coder: string;
  frame: number;
  keyframe: number;
  framerate: {
    min: number;
    max: number;
    avg: number;
  };
  fps: number;
  packet: number;
  pps: number;
  size_kb: number;
  bitrate_kbit: number;
  extradata_size_bytes: number;
  q: number;
  width?: number;
  height?: number;
  pix_fmt?: string;
}

export interface Progress {
  inputs: VideoInput[];
  outputs: any[];
  frame: number;
  packet: number;
  fps: number;
  q: number;
  size_kb: number;
  time: number;
  bitrate_kbit: number;
  speed: number;
  drop: number;
  dup: number;
}

export interface ProcessState {
  order: string;
  exec: string;
  runtime_seconds: number;
  reconnect_seconds: number;
  last_logline: string;
  progress: Progress;
  memory_bytes: number;
  cpu_usage: number;
}

export type InputType = 'srt' | 'rtmp';

export interface Process {
  id: string;
  type: string;
  reference: string;
  state?: ProcessState;
  metadata?: {
    'restreamer-ui'?: {
      name?: string;
      meta?: {
        name?: string;
        description?: string;
      };
    };
  };
  config: {
    input: Array<{
      address: string;
    }>;
    output?: Array<{
      address: string;
      options?: string[];
    }>;
  };
}

export interface InputProcess extends Process {
  outputs: OutputProcess[];
  inputType: InputType;
  streamName: string;
  order?: string;
  exec?: string;
  runtime_seconds?: number;
  reconnect_seconds?: number;
  last_logline?: string;
  progress?: Progress;
  memory_bytes?: number;
  cpu_usage?: number;
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