import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface TranscriptUpdate {
  text: string;
  timestamp: string;
  is_final: boolean;
}

interface RecordingScreenProps {
  modelId: string;
  onExit: () => void;
}

export default function RecordingScreen({
  modelId,
  onExit,
}: RecordingScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptUpdate[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setupTranscriptListener();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const setupTranscriptListener = async () => {
    await listen<TranscriptUpdate>('transcript-update', (event) => {
      console.log('Received transcript:', event.payload);
      setTranscripts((prev) => [...prev, event.payload]);
    });
  };

  const handleStartRecording = async () => {
    setError(null);
    try {
      await invoke('start_recording_mobile', { modelType: modelId });
      setIsRecording(true);
      setTranscripts([]);
      console.log('Recording started');
    } catch (err) {
      setError(`Failed to start recording: ${err}`);
      console.error('Recording error:', err);
    }
  };

  const handleStopRecording = async () => {
    try {
      await invoke('stop_recording_mobile');
      setIsRecording(false);
      console.log('Recording stopped');
    } catch (err) {
      setError(`Failed to stop recording: ${err}`);
      console.error('Stop error:', err);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const fullTranscript = transcripts.map((t) => t.text).join(' ');

  return (
    <div className="screen recording-screen">
      <div className="screen-header">
        <button onClick={onExit} className="back-button" disabled={isRecording}>
          ← Back
        </button>
        <h1>Recording</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="recording-content">
        {/* Recording Status Card */}
        <div className={`status-card ${isRecording ? 'recording' : 'idle'}`}>
          <div className="status-header">
            {isRecording ? (
              <>
                <div className="recording-indicator">
                  <span className="recording-dot"></span>
                  <span>Recording in progress</span>
                </div>
                <span className="recording-duration">
                  {formatDuration(recordingDuration)}
                </span>
              </>
            ) : (
              <>
                <span className="status-icon">🎙️</span>
                <span>Ready to record</span>
              </>
            )}
          </div>

          {isRecording && (
            <div className="audio-visualization">
              <div className="audio-bars">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="audio-bar"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      height: `${20 + Math.random() * 60}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <p className="status-description">
            {isRecording
              ? 'Speak clearly into your microphone. Transcription happens automatically.'
              : 'Tap the button below to start recording your meeting.'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Recording Controls */}
        <div className="recording-controls">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="button record-button"
            >
              <span className="button-icon">●</span>
              Start Recording
            </button>
          ) : (
            <button onClick={handleStopRecording} className="button stop-button">
              <span className="button-icon">■</span>
              Stop Recording
            </button>
          )}
        </div>

        {/* Transcription Display */}
        {transcripts.length > 0 && (
          <div className="transcription-section">
            <div className="section-header">
              <h2>Transcription</h2>
              <span className="transcript-count">{transcripts.length} segments</span>
            </div>

            {/* Full Transcript */}
            <div className="full-transcript">
              <h3>Complete Text</h3>
              <div className="transcript-text-box">
                <p>{fullTranscript || 'No transcription yet...'}</p>
              </div>
            </div>

            {/* Individual Segments */}
            <div className="transcript-segments">
              <h3>Segments</h3>
              <div className="segments-list">
                {transcripts
                  .slice()
                  .reverse()
                  .map((transcript, index) => (
                    <div
                      key={transcripts.length - 1 - index}
                      className="segment-item"
                    >
                      <div className="segment-header">
                        <span className="segment-time">
                          {formatTime(transcript.timestamp)}
                        </span>
                        {transcript.is_final && (
                          <span className="segment-badge">Final</span>
                        )}
                      </div>
                      <p className="segment-text">{transcript.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {transcripts.length === 0 && !isRecording && (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <h3>No transcription yet</h3>
            <p>Start recording to see your transcription appear here in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
