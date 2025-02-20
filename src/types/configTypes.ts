export interface RestreamerConfig {
  config: {
    address: string;
    api: {
      access: {
        http: {
          allow: string[];
          block: string[];
        };
        https: {
          allow: string[];
          block: string[];
        };
      };
      auth: {
        auth0: {
          enable: boolean;
          tenants: Array<{
            audience: string;
            clientid: string;
            domain: string;
            users: string[];
          }>;
        };
        disable_localhost: boolean;
        enable: boolean;
        jwt: {
          secret: string;
        };
        password: string;
        username: string;
      };
      read_only: boolean;
    };
    created_at: string;
    db: {
      dir: string;
    };
    debug: {
      force_gc: number;
      memory_limit_mbytes: number;
      profiling: boolean;
    };
    ffmpeg: {
      access: {
        input: {
          allow: string[];
          block: string[];
        };
        output: {
          allow: string[];
          block: string[];
        };
      };
      binary: string;
      log: {
        max_history: number;
        max_lines: number;
      };
      max_processes: number;
    };
    host: {
      auto: boolean;
      name: string[];
    };
    id: string;
    name: string;
    rtmp: {
      address: string;
      address_tls: string;
      app: string;
      enable: boolean;
      enable_tls: boolean;
      token: string;
    };
    srt: {
      address: string;
      enable: boolean;
      log: {
        enable: boolean;
        topics: string[];
      };
      passphrase: string;
      token: string;
    };
    storage: {
      disk: {
        dir: string;
        max_size_mbytes: number;
      };
      memory: {
        max_size_mbytes: number;
        purge: boolean;
      };
    };
    version: number;
  };
  created_at: string;
  loaded_at: string;
  updated_at: string;
  overrides: string[];
} 