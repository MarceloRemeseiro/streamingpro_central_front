import { AuthService } from './auth';

interface RTMPOutputConfig {
  type: 'rtmp';
  streamId: string;
  name: string;
  url: string;
  streamKey: string;
}

interface SRTOutputConfig {
  type: 'srt';
  streamId: string;
  name: string;
  url: string;
  port: string;
  latency: string;
  srtStreamId?: string;
  passphrase?: string;
}

export class OutputService {
  private static instance: OutputService;
  private auth: AuthService;

  private constructor() {
    this.auth = AuthService.getInstance();
  }

  public static getInstance(): OutputService {
    if (!OutputService.instance) {
      OutputService.instance = new OutputService();
    }
    return OutputService.instance;
  }

  private createRTMPConfig(config: RTMPOutputConfig) {
    const outputId = crypto.randomUUID();
    const cleanStreamId = config.streamId.split('.')[0];
    return {
      id: `restreamer-ui:egress:rtmp:${outputId}`,
      type: "ffmpeg",
      reference: cleanStreamId,
      config: {
        id: `restreamer-ui:egress:rtmp:${outputId}`,
        type: "ffmpeg",
        reference: cleanStreamId,
        input: [
          {
            id: "input_0",
            address: `{memfs}/${cleanStreamId}.m3u8`,
            options: ["-re"]
          }
        ],
        output: [
          {
            id: "output_0",
            address: config.url,
            options: [
              "-map",
              "0:0",
              "-codec:v",
              "copy",
              "-map",
              "0:1",
              "-codec:a",
              "copy",
              "-f",
              "flv",
              "-rtmp_enhanced_codecs",
              "hvc1,av01,vp09",
              "-rtmp_playpath",
              config.streamKey,
              "-rtmp_flashver",
              "FMLE/3.0"
            ]
          }
        ],
        options: [
          "-loglevel",
          "level+info",
          "-err_detect",
          "ignore_err"
        ],
        reconnect: true,
        reconnect_delay_seconds: 15,
        autostart: false,
        stale_timeout_seconds: 30,
        limits: {
          cpu_usage: 0,
          memory_mbytes: 0,
          waitfor_seconds: 5
        }
      },
      metadata: {
        "restreamer-ui": {
          name: config.name,
          control: {
            limits: {
              cpu_usage: 0,
              memory_mbytes: 0,
              waitfor_seconds: 5
            },
            process: {
              autostart: false,
              delay: 15,
              reconnect: true,
              staleTimeout: 30
            },
            source: {
              source: "hls+memfs"
            }
          }
        }
      }
    };
  }

  private createSRTConfig(config: SRTOutputConfig) {
    const outputId = crypto.randomUUID();
    const srtParams = new URLSearchParams();
    srtParams.append('latency', config.latency);
    srtParams.append('transtype', 'live');
    srtParams.append('mode', 'caller');
    if (config.srtStreamId) srtParams.append('streamid', config.srtStreamId);
    if (config.passphrase) srtParams.append('passphrase', config.passphrase);
    const cleanStreamId = config.streamId.split('.')[0];

    const address = `srt://${config.url}:${config.port}?${srtParams.toString()}`;

    return {
      id: `restreamer-ui:egress:srt:${outputId}`,
      type: "ffmpeg",
      reference: cleanStreamId,
      config: {
        id: `restreamer-ui:egress:srt:${outputId}`,
        type: "ffmpeg",
        reference: cleanStreamId,
        input: [
          {
            id: "input_0",
            address: `{memfs}/${cleanStreamId}.m3u8`,
            options: ["-re"]
          }
        ],
        output: [
          {
            id: "output_0",
            address: address,
            options: [
              "-map",
              "0:0",
              "-codec:v",
              "copy",
              "-map",
              "0:1",
              "-codec:a",
              "copy",
              "-bsf:v",
              "dump_extra",
              "-f",
              "mpegts"
            ]
          }
        ],
        options: [
          "-loglevel",
          "level+info",
          "-err_detect",
          "ignore_err"
        ],
        reconnect: true,
        reconnect_delay_seconds: 15,
        autostart: false,
        stale_timeout_seconds: 30,
        limits: {
          cpu_usage: 0,
          memory_mbytes: 0,
          waitfor_seconds: 5
        }
      },
      metadata: {
        "restreamer-ui": {
          name: config.name,
          control: {
            limits: {
              cpu_usage: 0,
              memory_mbytes: 0,
              waitfor_seconds: 5
            },
            process: {
              autostart: false,
              delay: 15,
              reconnect: true,
              staleTimeout: 30
            },
            source: {
              source: "hls+memfs"
            }
          }
        }
      }
    };
  }

  public async createOutput(config: RTMPOutputConfig | SRTOutputConfig) {
    const processConfig = config.type === 'rtmp' 
      ? this.createRTMPConfig(config)
      : this.createSRTConfig(config);

    const payload = {
      config: {
        id: processConfig.id,
        type: processConfig.type,
        reference: processConfig.reference,
        config: processConfig.config
      },
      metadata: processConfig.metadata
    };

    const response = await fetch('/api/process/output', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Error al crear el output');
    }

    return await response.json();
  }
} 