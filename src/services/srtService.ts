import { CreateProcessInput, ProcessConfig } from '@/types/createProcessTypes';
import { v4 as uuidv4 } from 'uuid';

export class SRTService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL || '';
  }

  private createProcessConfig() {
    const streamId = uuidv4();
    const config: ProcessConfig = {
      id: `restreamer-ui:ingest:${streamId}`,
      type: 'ffmpeg',
      reference: streamId,
      input: [
        {
          id: 'input_0',
          address: `{srt,name=${streamId}.stream,mode=request}`,
          options: [
            '-fflags',
            '+genpts',
            '-thread_queue_size',
            '512',
            '-probesize',
            '5000000',
            '-analyzeduration',
            '5000000'
          ]
        }
      ],
      output: [
        {
          id: 'output_0',
          address: `[f=hls:start_number=0:hls_time=2:hls_list_size=6:hls_flags=append_list+delete_segments+program_date_time+temp_file:hls_delete_threshold=4:hls_segment_filename={memfs^:}/${streamId}_{outputid}_%04d.ts:master_pl_name=${streamId}.m3u8:master_pl_publish_rate=2:method=PUT]{memfs}/${streamId}_{outputid}.m3u8|[f=flv]{rtmp,name=${streamId}.stream}|[f=mpegts]{srt,name=${streamId},mode=publish}`,
          options: [
            '-dn',
            '-sn',
            '-map',
            '0:0',
            '-codec:v',
            'copy',
            '-map',
            '0:1',
            '-codec:a',
            'copy',
            '-metadata',
            `title=https://${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL}/${streamId}/oembed.json`,
            '-metadata',
            'service_provider=datarhei-Restreamer',
            '-flags',
            '+low_delay+global_header',
            '-tag:v',
            '7',
            '-tag:a',
            '10',
            '-f',
            'tee'
          ],
          cleanup: [
            {
              pattern: `memfs:/${streamId}**`,
              max_files: 0,
              max_file_age_seconds: 0,
              purge_on_delete: true
            },
            {
              pattern: `memfs:/${streamId}_{outputid}.m3u8`,
              max_files: 0,
              max_file_age_seconds: 24,
              purge_on_delete: true
            },
            {
              pattern: `memfs:/${streamId}_{outputid}_**.ts`,
              max_files: 12,
              max_file_age_seconds: 24,
              purge_on_delete: true
            },
            {
              pattern: `memfs:/${streamId}.m3u8`,
              max_files: 0,
              max_file_age_seconds: 24,
              purge_on_delete: true
            }
          ]
        }
      ],
      options: [
        '-loglevel',
        'level+info',
        '-err_detect',
        'ignore_err',
        '-y'
      ],
      reconnect: true,
      reconnect_delay_seconds: 15,
      autostart: true,
      stale_timeout_seconds: 30,
      limits: {
        cpu_usage: 0,
        memory_mbytes: 0,
        waitfor_seconds: 5
      }
    };

    return config;
  }

  private createProcessMetadata(input: CreateProcessInput) {
    return {
      control: {
        hls: {
          cleanup: true,
          lhls: false,
          listSize: 6,
          master_playlist: true,
          segmentDuration: 2,
          storage: "memfs",
          version: 3
        },
        limits: {
          cpu_usage: 0,
          memory_mbytes: 0,
          waitfor_seconds: 5
        },
        process: {
          autostart: true,
          delay: 15,
          low_delay: true,
          reconnect: true,
          staleTimeout: 30
        },
        rtmp: {
          enable: true
        },
        snapshot: {
          enable: true,
          interval: 60
        },
        srt: {
          enable: true
        }
      },
      license: "CC BY 4.0",
      meta: {
        author: {
          description: "",
          name: ""
        },
        description: input.description || input.name || "",
        name: input.name || ""
      },
      player: {},
      profiles: [
        {
          audio: {
            coder: "copy",
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
            stream: 1
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
      ]
    };
  }

  async createProcess(input: CreateProcessInput): Promise<string> {
    try {
      const config = this.createProcessConfig();
      const metadata = this.createProcessMetadata(input);

      const payload = {
        config,
        metadata
      };


      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server response:', text);
        throw new Error(text || 'Error creating SRT process');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error creating SRT process:', error);
      throw error;
    }
  }
} 