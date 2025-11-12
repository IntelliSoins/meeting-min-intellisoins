import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface ModelInfo {
  id: string;
  name: string;
  size_mb: number;
  speed: string;
  recommended: boolean;
}

interface TranscriptUpdate {
  text: string;
  timestamp: string;
  is_final: boolean;
}

function App() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('base.en');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptUpdate[]>([]);

  useEffect(() => {
    loadModels();
    setupTranscriptListener();
  }, []);

  const loadModels = async () => {
    try {
      const availableModels = await invoke<ModelInfo[]>('get_available_models');
      setModels(availableModels);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const setupTranscriptListener = async () => {
    await listen<TranscriptUpdate>('transcript-update', (event) => {
      console.log('Received transcript:', event.payload);
      setTranscripts((prev) => [...prev, event.payload]);
    });
  };

  const handleDownloadModel = async () => {
    setIsLoading(true);
    try {
      await invoke('download_whisper_model', { modelType: selectedModel });
      alert('Model downloaded successfully!');
    } catch (error) {
      alert(`Download failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      await invoke('start_recording_mobile', { modelType: selectedModel });
      setIsRecording(true);
      setTranscripts([]); // Clear previous transcripts
      console.log('Recording started');
    } catch (error) {
      alert(`Failed to start recording: ${error}`);
    }
  };

  const handleStopRecording = async () => {
    try {
      await invoke('stop_recording_mobile');
      setIsRecording(false);
      console.log('Recording stopped');
    } catch (error) {
      alert(`Failed to stop recording: ${error}`);
    }
  };

  return (
    <div className="container">
      <h1>Meetily Mobile</h1>
      <p>Privacy-first meeting assistant with local transcription</p>

      <div className="models-section">
        <h2>Choose Whisper Model</h2>
        {models.map((model) => (
          <div
            key={model.id}
            className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => !isRecording && setSelectedModel(model.id)}
          >
            <div className="model-header">
              <h3>{model.name}</h3>
              {model.recommended && <span className="badge">Recommended</span>}
            </div>
            <p>Size: {model.size_mb} MB</p>
            <p>Speed: {model.speed}</p>
          </div>
        ))}
      </div>

      <div className="actions">
        <button
          onClick={handleDownloadModel}
          disabled={isLoading || isRecording}
          className="button primary"
        >
          {isLoading ? 'Downloading...' : 'Download Model'}
        </button>

        {!isRecording ? (
          <button onClick={handleStartRecording} className="button secondary">
            Start Recording
          </button>
        ) : (
          <button onClick={handleStopRecording} className="button danger">
            Stop Recording
          </button>
        )}
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <span className="recording-dot"></span>
          <span>Recording in progress...</span>
        </div>
      )}

      {transcripts.length > 0 && (
        <div className="transcripts-section">
          <h2>Transcription</h2>
          <div className="transcripts-list">
            {transcripts.map((transcript, index) => (
              <div key={index} className="transcript-item">
                <div className="transcript-header">
                  <span className="transcript-time">
                    {new Date(transcript.timestamp).toLocaleTimeString()}
                  </span>
                  {transcript.is_final && (
                    <span className="transcript-badge">Final</span>
                  )}
                </div>
                <p className="transcript-text">{transcript.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info">
        <p>
          <strong>How it works:</strong> Speak into your microphone. The app
          will detect speech, buffer it, and transcribe it locally using
          Whisper. All processing happens on your device - no data leaves your
          phone!
        </p>
      </div>
    </div>
  );
}

export default App;
