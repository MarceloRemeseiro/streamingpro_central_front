export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface ProcessMetadata {
  "restreamer-ui"?: {
    meta?: {
      name?: string;
      description?: string;
    };
    name?: string;
  };
}

export interface ProcessConfig {
  input: Array<{
    address: string;
  }>;
  output?: Array<{
    address: string;
    options?: string[];
  }>;
}

export interface ProcessStateExtras {
  runtime_seconds?: number;
  reconnect_seconds?: number;
  last_logline?: string;
  progress?: {
    frame?: number;
    packet?: number;
    fps?: number;
    time?: number;
    bitrate_kbit?: number;
    speed?: number;
    drop?: number;
    dup?: number;
  };
  memory_bytes?: number;
  cpu_usage?: number;
}

export interface Process {
  id: string;
  type: string;
  reference: string;
  created_at: number;
  state?: {
    exec?: string;
    order?: string;
  } & ProcessStateExtras;
  metadata?: ProcessMetadata;
  config: ProcessConfig;
}

export interface InputInfo {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  createdAtFormatted: string;
  streamId: string;
  state: string;
  type: 'rtmp' | 'srt';
  inputAddress: string;
  defaultOutputs: {
    SRT: string;
    RTMP: string;
    HLS: string;
    HTML: string;
  };
  customOutputs: OutputInfo[];
}

export interface OutputInfo {
  id: string;
  name: string;
  address: string;
  state: string;
  order: string;
  streamKey: string;
}

export interface AuthConfig {
  apiUrl: string;
  baseUrl: string;
  port: string;
  username: string;
  password: string;
} 