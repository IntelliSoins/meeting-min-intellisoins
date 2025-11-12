// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Runtime;
use serde::{Deserialize, Serialize};

mod whisper_engine;
mod audio;

use whisper_engine::MobileWhisperEngine;

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

    // TODO: Implement model download
    // For now, return success as placeholder

    Ok(())
}

#[tauri::command]
async fn start_recording_mobile<R: Runtime>(
    app: tauri::AppHandle<R>,
    model_type: String,
) -> Result<(), String> {
    log::info!("Starting mobile recording with model: {}", model_type);

    // TODO: Implement recording start
    // 1. Init Whisper engine
    // 2. Start audio capture
    // 3. Begin transcription loop

    Ok(())
}

#[tauri::command]
async fn stop_recording_mobile() -> Result<(), String> {
    log::info!("Stopping mobile recording");

    // TODO: Implement recording stop

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_available_models,
            download_whisper_model,
            start_recording_mobile,
            stop_recording_mobile,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
