import { AuthService } from './auth';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
    const outputId = generateUUID();
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
          },
          name: config.name,
          outputs: [
            {
              address: config.url,
              options: [
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
          profiles: [
            {
              audio: {
                decoder: {
                  coder: "default",
                  mapping: {
                    filter: [],
                    global: [],
                    local: []
                  },
                  settings: {}
                },
                encoder: {
                  coder: "copy",
                  mapping: {
                    filter: [],
                    global: [],
                    local: [
                      "-codec:a",
                      "copy"
                    ]
                  },
                  settings: {}
                },
                filter: {
                  graph: "",
                  settings: {}
                },
                source: 0,
                stream: 1
              },
              custom: {
                selected: false,
                stream: -1
              },
              video: {
                decoder: {
                  coder: "default",
                  mapping: {
                    filter: [],
                    global: [],
                    local: []
                  },
                  settings: {}
                },
                encoder: {
                  coder: "copy",
                  mapping: {
                    filter: [],
                    global: [],
                    local: [
                      "-codec:v",
                      "copy"
                    ]
                  },
                  settings: {}
                },
                filter: {
                  graph: "",
                  settings: {}
                },
                source: 0,
                stream: 0
              }
            }
          ],
          settings: {
            address: config.url.replace('rtmp://', ''),
            options: {
              rtmp_app: "",
              rtmp_conn: "",
              rtmp_flashver: "FMLE/3.0",
              rtmp_flush_interval: "10",
              rtmp_pageurl: "",
              rtmp_playpath: config.streamKey,
              rtmp_swfhash: "",
              rtmp_swfsize: "",
              rtmp_tcurl: ""
            },
            protocol: "rtmp://"
          },
          streams: [
            {
              channels: 0,
              codec: "h264",
              height: 1080,
              index: 0,
              layout: "",
              pix_fmt: "",
              sampling_hz: 0,
              stream: 0,
              type: "video",
              url: "",
              width: 1920
            },
            {
              channels: 2,
              codec: "aac",
              height: 0,
              index: 0,
              layout: "stereo",
              pix_fmt: "",
              sampling_hz: 48000,
              stream: 1,
              type: "audio",
              url: "",
              width: 0
            }
          ],
          version: "1.14.0"
        }
      }
    };
  }

  private createSRTConfig(config: SRTOutputConfig) {
    const outputId = generateUUID();
    const srtParams = new URLSearchParams();
    srtParams.append('mode', 'caller');
    srtParams.append('transtype', 'live');
    srtParams.append('latency', config.latency);
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
          },
          name: config.name,
          outputs: [
            {
              address: address,
              options: [
                "-bsf:v",
                "dump_extra",
                "-f",
                "mpegts"
              ]
            }
          ],
          profiles: [
            {
              audio: {
                decoder: {
                  coder: "default",
                  mapping: {
                    filter: [],
                    global: [],
                    local: []
                  },
                  settings: {}
                },
                encoder: {
                  coder: "copy",
                  mapping: {
                    filter: [],
                    global: [],
                    local: [
                      "-codec:a",
                      "copy"
                    ]
                  },
                  settings: {}
                },
                filter: {
                  graph: "",
                  settings: {}
                },
                source: 0,
                stream: 1
              },
              custom: {
                selected: false,
                stream: -1
              },
              video: {
                decoder: {
                  coder: "default",
                  mapping: {
                    filter: [],
                    global: [],
                    local: []
                  },
                  settings: {}
                },
                encoder: {
                  coder: "copy",
                  mapping: {
                    filter: [],
                    global: [],
                    local: [
                      "-codec:v",
                      "copy"
                    ]
                  },
                  settings: {}
                },
                filter: {
                  graph: "",
                  settings: {}
                },
                source: 0,
                stream: 0
              }
            }
          ],
          settings: {
            address: config.url+":"+config.port,
            protocol: "srt://",
            params: {
              mode: "caller",
              transtype: "live",
              latency: config.latency,
              streamid: config.srtStreamId || "",
              passphrase: config.passphrase || "",
              connect_timeout: "3000",
              enforced_encryption: false,
              ffs: "25600",
              inputbw: "0",
              iptos: "0xB8",
              ipttl: "64",
              kmpreannounce: "-1",
              kmrefreshrate: "-1",
              listen_timeout: "0",
              lossmaxttl: "0",
              maxbw: "0",
              mss: "1500",
              nakreport: true,
              oheadbw: "25",
              payload_size: "-1",
              pbkeylen: "16",
              rcvbuf: "0",
              send_buffer_size: "0",
              smoother: "live",
              sndbuf: "0",
              timeout: "3000000",
              tlpktdrop: true
            }
          },
          streams: [
            {
              channels: 0,
              codec: "h264",
              height: 1080,
              index: 0,
              layout: "",
              pix_fmt: "",
              sampling_hz: 0,
              stream: 0,
              type: "video",
              url: "",
              width: 1920
            },
            {
              channels: 2,
              codec: "aac",
              height: 0,
              index: 0,
              layout: "stereo",
              pix_fmt: "",
              sampling_hz: 48000,
              stream: 1,
              type: "audio",
              url: "",
              width: 0
            }
          ],
          version: "1.14.0"
        }
      }
    };
  }

  async createOutput(output: RTMPOutputConfig | SRTOutputConfig): Promise<string> {
    try {
      const processConfig = output.type === 'rtmp' 
        ? this.createRTMPConfig(output)
        : this.createSRTConfig(output);

      const payload = {
        config: processConfig.config,
        metadata: processConfig.metadata["restreamer-ui"]
      };

      const response = await fetch('/api/process/output', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server response:', text);
        throw new Error(text || 'Error creating output');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Create Output Error:', error);
      throw error;
    }
  }

  public async updateOutput(id: string, config: { type: 'rtmp' | 'srt', config: any }) {
    const response = await fetch(`/api/process/output/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        type: config.type,
        config: config.config
      })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el output');
    }

    return await response.json();
  }
} 