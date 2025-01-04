export type ProcessType = 'rtmp' | 'srt';
export type Resolution = '1920x1080' | '1280x720';
export type FPS = 23.98 | 24 | 25 | 29.97 | 30 | 59.94 | 60;

export interface CreateProcessInput {
  type: ProcessType;
  name: string;
  description?: string;
  resolution?: Resolution;
  fps?: FPS;
  latency?: number;
}

export interface ProcessInputConfig {
  id: string;
  address: string;
  options: string[];
}

export interface ProcessOutputConfig {
  id: string;
  address: string;
  options: string[];
  cleanup?: Array<{
    pattern: string;
    max_files: number;
    max_file_age_seconds: number;
    purge_on_delete: boolean;
  }>;
}

export interface ProcessConfig {
  id: string;
  type: string;
  reference: string;
  input: ProcessInputConfig[];
  output: ProcessOutputConfig[];
  options: string[];
  reconnect: boolean;
  reconnect_delay_seconds: number;
  autostart: boolean;
  stale_timeout_seconds: number;
  limits: {
    cpu_usage: number;
    memory_mbytes: number;
    waitfor_seconds: number;
  };
}

export interface ProcessMetadata {
  control: {
    hls: {
      cleanup: boolean;
      lhls: boolean;
      listSize: number;
      master_playlist: boolean;
      segmentDuration: number;
      storage: string;
      version: number;
    };
    limits: {
      cpu_usage: number;
      memory_mbytes: number;
      waitfor_seconds: number;
    };
    process: {
      autostart: boolean;
      delay: number;
      low_delay: boolean;
      reconnect: boolean;
      staleTimeout: number;
    };
    rtmp: {
      enable: boolean;
    };
    snapshot: {
      enable: boolean;
      interval: number;
    };
    srt: {
      enable: boolean;
    };
  };
  license: string;
  meta: {
    author: {
      description: string;
      name: string;
    };
    description: string;
    name: string;
  };
  player: Record<string, unknown>;
  profiles: Array<{
    audio: {
      coder: string;
      decoder: {
        coder: string;
        mapping: {
          filter: string[];
          global: string[];
          local: string[];
        };
        settings: Record<string, unknown>;
      };
      encoder: {
        coder: string;
        mapping: {
          filter: string[];
          global: string[];
          local: string[];
        };
        settings: Record<string, unknown>;
      };
      filter: {
        graph: string;
        settings: Record<string, unknown>;
      };
      source: number;
      stream: number;
    };
    custom: {
      selected: boolean;
      stream: number;
    };
    video: {
      decoder: {
        coder: string;
        mapping: {
          filter: string[];
          global: string[];
          local: string[];
        };
        settings: Record<string, unknown>;
      };
      encoder: {
        coder: string;
        mapping: {
          filter: string[];
          global: string[];
          local: string[];
        };
        settings: Record<string, unknown>;
      };
      filter: {
        graph: string;
        settings: Record<string, unknown>;
      };
      source: number;
      stream: number;
    };
  }>;
}

export interface CreateProcessPayload {
  config: ProcessConfig;
  metadata: ProcessMetadata;
} 