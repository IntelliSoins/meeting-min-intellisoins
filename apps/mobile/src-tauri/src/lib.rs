// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Runtime;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::mpsc;

mod whisper_engine;
mod audio;
mod recording_state;

use whisper_engine::{MobileWhisperEngine, ModelType};
use audio::{AudioProcessor, start_microphone_capture, TranscriptionEvent};
use recording_state::RECORDING_STATE;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub size_mb: u64,
    pub speed: String,
    pub recommended: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptUpdate {
    pub text: String,
    pub timestamp: String,
    pub is_final: bool,
}

#[tauri::command]
async fn get_available_models() -> Result<Vec<ModelInfo>, String> {
    Ok(vec![
        ModelInfo {
            id: "tiny.en".to_string(),
            name: "Tiny (Fast)".to_string(),
            size_mb: 40,
            speed: "Real-time".to_string(),
            recommended: false,
        },
        ModelInfo {
            id: "base.en".to_string(),
            name: "Base (Recommended)".to_string(),
            size_mb: 75,
            speed: "2-3x real-time".to_string(),
            recommended: true,
        },
        ModelInfo {
            id: "small.en".to_string(),
            name: "Small (Best Quality)".to_string(),
            size_mb: 200,
            speed: "4-5x real-time".to_string(),
            recommended: false,
        },
    ])
}

#[tauri::command]
async fn download_whisper_model(
    model_type: String,
) -> Result<(), String> {
    log::info!("Downloading Whisper model: {}", model_type);

    // Parse model type
    let model = ModelType::from_str(&model_type)
        .map_err(|e| format!("Invalid model type: {}", e))?;

    // Create engine (this will download model if needed)
    let engine = MobileWhisperEngine::new(model)
        .await
        .map_err(|e| format!("Failed to download model: {}", e))?;

    // Store engine in global state
    let mut state = RECORDING_STATE.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    state.set_whisper_engine(Arc::new(engine));

    log::info!("Model downloaded and loaded successfully");
    Ok(())
}

#[tauri::command]
async fn start_recording_mobile<R: Runtime>(
    app: tauri::AppHandle<R>,
    model_type: String,
) -> Result<(), String> {
    log::info!("Starting mobile recording with model: {}", model_type);

    // Check if already recording
    {
        let state = RECORDING_STATE.lock()
            .map_err(|e| format!("Failed to lock state: {}", e))?;
        if state.is_recording() {
            return Err("Already recording".to_string());
        }
    }

    // Get or create Whisper engine
    let whisper_engine = {
        let state = RECORDING_STATE.lock()
            .map_err(|e| format!("Failed to lock state: {}", e))?;

        if let Some(engine) = state.get_whisper_engine() {
            engine
        } else {
            // No engine yet, create one
            drop(state); // Release lock before async operation
            let model = ModelType::from_str(&model_type)
                .map_err(|e| format!("Invalid model type: {}", e))?;
            let engine = Arc::new(
                MobileWhisperEngine::new(model)
                    .await
                    .map_err(|e| format!("Failed to create Whisper engine: {}", e))?
            );

            // Store it
            let mut state = RECORDING_STATE.lock()
                .map_err(|e| format!("Failed to lock state: {}", e))?;
            state.set_whisper_engine(Arc::clone(&engine));
            engine
        }
    };

    // Create event channel
    let (event_tx, event_rx) = mpsc::unbounded_channel();

    // Create audio processor
    let processor = Arc::new(AudioProcessor::new(whisper_engine, event_tx));

    // Start audio capture
    let audio_stream = start_microphone_capture(Arc::clone(&processor))
        .map_err(|e| format!("Failed to start audio capture: {}", e))?;

    // Store in global state
    {
        let mut state = RECORDING_STATE.lock()
            .map_err(|e| format!("Failed to lock state: {}", e))?;
        state.set_audio_processor(processor);
        state.set_audio_stream(audio_stream);
        state.set_event_receiver(event_rx);
    }

    // Start event forwarding task
    let app_clone = app.clone();
    tokio::spawn(async move {
        let mut rx = {
            let mut state = RECORDING_STATE.lock().unwrap();
            state.take_event_receiver()
        };

        if let Some(ref mut receiver) = rx {
            while let Some(event) = receiver.recv().await {
                log::debug!("Forwarding transcription event: {}", event.text);

                let update = TranscriptUpdate {
                    text: event.text,
                    timestamp: event.timestamp,
                    is_final: event.is_final,
                };

                if let Err(e) = app_clone.emit("transcript-update", update) {
                    log::error!("Failed to emit transcript-update event: {}", e);
                }
            }
        }
    });

    log::info!("Recording started successfully");
    Ok(())
}

#[tauri::command]
async fn stop_recording_mobile() -> Result<(), String> {
    log::info!("Stopping mobile recording");

    let mut state = RECORDING_STATE.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;

    if !state.is_recording() {
        return Err("Not recording".to_string());
    }

    state.stop_recording();
    log::info!("Recording stopped successfully");
    Ok(())
}

#[tauri::command]
async fn get_recording_status() -> Result<bool, String> {
    let state = RECORDING_STATE.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    Ok(state.is_recording())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logger
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_available_models,
            download_whisper_model,
            start_recording_mobile,
            stop_recording_mobile,
            get_recording_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
