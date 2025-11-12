import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ModelInfo {
  id: string;
  name: string;
  size_mb: number;
  speed: string;
  recommended: boolean;
}

function App() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('base.en');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const availableModels = await invoke<ModelInfo[]>('get_available_models');
      setModels(availableModels);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
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
      alert('Recording started!');
    } catch (error) {
      alert(`Failed to start recording: ${error}`);
    }
  };

  return (
    <div className="container">
      <h1>Meetily Mobile</h1>
      <p>Privacy-first meeting assistant</p>

      <div className="models-section">
        <h2>Choose Whisper Model</h2>
        {models.map((model) => (
          <div
            key={model.id}
            className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => setSelectedModel(model.id)}
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
          disabled={isLoading}
          className="button primary"
        >
          {isLoading ? 'Downloading...' : 'Download Model'}
        </button>

        <button onClick={handleStartRecording} className="button secondary">
          Start Recording
        </button>
      </div>

      <div className="info">
        <p>
          <strong>Note:</strong> This is a basic UI for testing. Full mobile UI
          will be implemented in Phase 2, Week 5.
        </p>
      </div>
    </div>
  );
}

export default App;
