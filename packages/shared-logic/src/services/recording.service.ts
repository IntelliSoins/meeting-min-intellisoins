// Recording service abstraction
import { invoke } from '@tauri-apps/api/core';
import type { RecordingMode } from '../types';

export class RecordingService {
  private mode: RecordingMode;

  constructor(mode: RecordingMode = 'local') {
    this.mode = mode;
  }

  async startRecording(options: {
    micDevice?: string;
    systemDevice?: string;
    meetingName?: string;
  }): Promise<void> {
    if (this.mode === 'local') {
      return invoke('start_recording', options);
    } else {
      return invoke('start_recording_mobile', {
        modelType: 'base',
        ...options,
      });
    }
  }

  async stopRecording(): Promise<void> {
    return invoke('stop_recording');
  }

  async pauseRecording(): Promise<void> {
    return invoke('pause_recording');
  }

  async resumeRecording(): Promise<void> {
    return invoke('resume_recording');
  }
}
