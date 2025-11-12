import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import SetupScreen from './screens/SetupScreen';
import RecordingScreen from './screens/RecordingScreen';

type Screen = 'setup' | 'recording';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('setup');
  const [selectedModel, setSelectedModel] = useState<string>('base.en');
  const [isModelReady, setIsModelReady] = useState(false);

  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      // Check if a model is already loaded
      const status = await invoke<boolean>('get_recording_status');
      // If we can get status, assume model might be ready
      // In a full implementation, we'd have a separate command for this
      console.log('Recording status:', status);
    } catch (error) {
      console.log('No model loaded yet:', error);
    }
  };

  const handleSetupComplete = (modelId: string) => {
    setSelectedModel(modelId);
    setIsModelReady(true);
    setCurrentScreen('recording');
  };

  const handleExitRecording = () => {
    setCurrentScreen('setup');
  };

  return (
    <div className="app">
      {currentScreen === 'setup' && (
        <SetupScreen onSetupComplete={handleSetupComplete} />
      )}

      {currentScreen === 'recording' && (
        <RecordingScreen modelId={selectedModel} onExit={handleExitRecording} />
      )}
    </div>
  );
}

export default App;
