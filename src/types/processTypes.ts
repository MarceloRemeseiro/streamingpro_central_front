import { Process } from './restreamer';

export type InputType = 'srt' | 'rtmp';

export interface InputProcess extends Process {
  outputs: OutputProcess[];
  inputType: InputType;
  streamName: string;
}

export interface OutputProcess extends Process {
  parentId: string;
} 