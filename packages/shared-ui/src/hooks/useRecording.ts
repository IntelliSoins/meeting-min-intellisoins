import { useState, useCallback } from 'react';
import { RecordingService } from '@meetily/shared-logic';

export function useRecording(mode: 'local' | 'cloud' = 'local') {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const service = new RecordingService(mode);

  const start = useCallback(async (options?: any) => {
    try {
      await service.startRecording(options || {});
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [service]);

  const stop = useCallback(async () => {
    try {
      await service.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }, [service]);

  const pause = useCallback(async () => {
    try {
      await service.pauseRecording();
      setIsPaused(true);
    } catch (error) {
      console.error('Failed to pause recording:', error);
      throw error;
    }
  }, [service]);

  const resume = useCallback(async () => {
    try {
      await service.resumeRecording();
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to resume recording:', error);
      throw error;
    }
  }, [service]);

  return {
    isRecording,
    isPaused,
    start,
    stop,
    pause,
    resume,
  };
}
