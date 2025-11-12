use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

use crate::audio::{AudioProcessor, AudioStream, TranscriptionEvent};
use crate::whisper_engine::MobileWhisperEngine;

pub struct RecordingState {
    whisper_engine: Option<Arc<MobileWhisperEngine>>,
    audio_stream: Option<AudioStream>,
    audio_processor: Option<Arc<AudioProcessor>>,
    event_rx: Option<mpsc::UnboundedReceiver<TranscriptionEvent>>,
    is_recording: bool,
}

impl RecordingState {
    pub fn new() -> Self {
        Self {
            whisper_engine: None,
            audio_stream: None,
            audio_processor: None,
            event_rx: None,
            is_recording: false,
        }
    }

    pub fn is_recording(&self) -> bool {
        self.is_recording
    }

    pub fn set_whisper_engine(&mut self, engine: Arc<MobileWhisperEngine>) {
        self.whisper_engine = Some(engine);
    }

    pub fn get_whisper_engine(&self) -> Option<Arc<MobileWhisperEngine>> {
        self.whisper_engine.clone()
    }

    pub fn set_audio_processor(&mut self, processor: Arc<AudioProcessor>) {
        self.audio_processor = Some(processor);
    }

    pub fn get_audio_processor(&self) -> Option<Arc<AudioProcessor>> {
        self.audio_processor.clone()
    }

    pub fn set_audio_stream(&mut self, stream: AudioStream) {
        self.audio_stream = Some(stream);
        self.is_recording = true;
    }

    pub fn set_event_receiver(&mut self, rx: mpsc::UnboundedReceiver<TranscriptionEvent>) {
        self.event_rx = Some(rx);
    }

    pub fn take_event_receiver(&mut self) -> Option<mpsc::UnboundedReceiver<TranscriptionEvent>> {
        self.event_rx.take()
    }

    pub fn stop_recording(&mut self) {
        if let Some(stream) = &self.audio_stream {
            stream.stop();
        }
        self.audio_stream = None;
        self.is_recording = false;
        log::info!("Recording stopped");
    }

    pub fn clear(&mut self) {
        self.stop_recording();
        self.whisper_engine = None;
        self.audio_processor = None;
        self.event_rx = None;
    }
}

impl Default for RecordingState {
    fn default() -> Self {
        Self::new()
    }
}

// Global recording state
lazy_static::lazy_static! {
    pub static ref RECORDING_STATE: Arc<Mutex<RecordingState>> = Arc::new(Mutex::new(RecordingState::new()));
}
