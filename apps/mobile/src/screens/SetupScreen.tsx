import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ModelInfo {
  id: string;
  name: string;
  size_mb: number;
  speed: string;
  recommended: boolean;
}

interface SetupScreenProps {
  onSetupComplete: (modelId: string) => void;
}

export default function SetupScreen({ onSetupComplete }: SetupScreenProps) {
  const [models] = useState<ModelInfo[]>([
    {
      id: 'tiny.en',
      name: 'Tiny',
      size_mb: 40,
      speed: 'Real-time',
      recommended: false,
    },
    {
      id: 'base.en',
      name: 'Base',
      size_mb: 75,
      speed: '2-3x real-time',
      recommended: true,
    },
    {
      id: 'small.en',
      name: 'Small',
      size_mb: 200,
      speed: '4-5x real-time',
      recommended: false,
    },
  ]);

  const [selectedModel, setSelectedModel] = useState<string>('base.en');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadAndContinue = async () => {
    setIsDownloading(true);
    setError(null);
    setDownloadProgress(0);

    try {
      // Simulate progress (in real app, this would come from Rust via events)
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      await invoke('download_whisper_model', { modelType: selectedModel });

      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Wait a bit to show 100%
      await new Promise((resolve) => setTimeout(resolve, 500));

      onSetupComplete(selectedModel);
    } catch (err) {
      setError(`Failed to download model: ${err}`);
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const selectedModelInfo = models.find((m) => m.id === selectedModel);

  return (
    <div className="screen setup-screen">
      <div className="screen-header">
        <h1>🎙️ Meetily Mobile</h1>
        <p className="subtitle">Privacy-first meeting assistant</p>
      </div>

      <div className="setup-content">
        <div className="section">
          <h2>Choose Your Whisper Model</h2>
          <p className="section-description">
            Select the transcription model that best fits your needs. All
            models run locally on your device.
          </p>

          <div className="models-grid">
            {models.map((model) => (
              <div
                key={model.id}
                className={`model-card ${
                  selectedModel === model.id ? 'selected' : ''
                } ${isDownloading ? 'disabled' : ''}`}
                onClick={() => !isDownloading && setSelectedModel(model.id)}
              >
                <div className="model-card-header">
                  <h3>{model.name}</h3>
                  {model.recommended && (
                    <span className="badge recommended">⭐ Recommended</span>
                  )}
                </div>

                <div className="model-stats">
                  <div className="stat">
                    <span className="stat-label">Size</span>
                    <span className="stat-value">{model.size_mb} MB</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Speed</span>
                    <span className="stat-value">{model.speed}</span>
                  </div>
                </div>

                <div className="model-description">
                  {model.id === 'tiny.en' && (
                    <p>Fastest option, good for quick notes</p>
                  )}
                  {model.id === 'base.en' && (
                    <p>Balanced speed and accuracy - perfect for most meetings</p>
                  )}
                  {model.id === 'small.en' && (
                    <p>Best accuracy, slower processing</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedModelInfo && (
          <div className="selection-summary">
            <div className="summary-header">
              <span className="summary-icon">✓</span>
              <h3>Selected: {selectedModelInfo.name}</h3>
            </div>
            <p>
              This model will be downloaded to your device (
              {selectedModelInfo.size_mb} MB). The download happens once, and
              the model is saved for future use.
            </p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {isDownloading && (
          <div className="download-progress">
            <div className="progress-header">
              <span>Downloading {selectedModelInfo?.name} model...</span>
              <span className="progress-percentage">{downloadProgress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="progress-info">
              This may take a few moments depending on your connection.
            </p>
          </div>
        )}

        <div className="setup-actions">
          <button
            onClick={handleDownloadAndContinue}
            disabled={isDownloading}
            className="button primary large"
          >
            {isDownloading ? 'Downloading...' : 'Download & Continue'}
          </button>

          <div className="privacy-notice">
            <span className="privacy-icon">🔒</span>
            <p>
              <strong>100% Private:</strong> All transcription happens on your
              device. No data is sent to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
