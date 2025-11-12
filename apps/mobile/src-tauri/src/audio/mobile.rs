use anyhow::Result;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::Stream;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

use super::buffer::AudioBuffer;
use crate::whisper_engine::MobileWhisperEngine;

pub struct AudioStream {
    _stream: Stream,
    stop_tx: mpsc::UnboundedSender<()>,
}

impl AudioStream {
    pub fn stop(&self) {
        let _ = self.stop_tx.send(());
    }
}

pub struct AudioProcessor {
    buffer: Arc<Mutex<AudioBuffer>>,
    whisper_engine: Arc<MobileWhisperEngine>,
    event_tx: mpsc::UnboundedSender<TranscriptionEvent>,
}

#[derive(Debug, Clone)]
pub struct TranscriptionEvent {
    pub text: String,
    pub timestamp: String,
    pub is_final: bool,
}

impl AudioProcessor {
    pub fn new(
        whisper_engine: Arc<MobileWhisperEngine>,
        event_tx: mpsc::UnboundedSender<TranscriptionEvent>,
    ) -> Self {
        Self {
            buffer: Arc::new(Mutex::new(AudioBuffer::new())),
            whisper_engine,
            event_tx,
        }
    }

    pub fn process_chunk(&self, data: &[f32]) {
        let mut buffer = match self.buffer.lock() {
            Ok(b) => b,
            Err(e) => {
                log::error!("Failed to lock buffer: {}", e);
                return;
            }
        };

        // Check for speech
        let has_speech = buffer.has_speech(data);
        buffer.update_speech_state(has_speech);

        // Add samples to buffer
        buffer.push_samples(data);

        // Check if we should transcribe
        if buffer.should_transcribe() {
            log::info!(
                "Transcribing buffer ({:.1}s of audio)",
                buffer.duration_secs()
            );

            // Extract audio for transcription
            let audio = buffer.extract_for_transcription();

            // Transcribe in background
            let whisper = Arc::clone(&self.whisper_engine);
            let event_tx = self.event_tx.clone();

            tokio::spawn(async move {
                match whisper.transcribe_chunk(&audio) {
                    Ok(text) => {
                        if !text.is_empty() {
                            log::info!("Transcription: {}", text);
                            let event = TranscriptionEvent {
                                text,
                                timestamp: chrono::Utc::now().to_rfc3339(),
                                is_final: true,
                            };
                            let _ = event_tx.send(event);
                        }
                    }
                    Err(e) => {
                        log::error!("Transcription failed: {}", e);
                    }
                }
            });
        }
    }

    pub fn get_buffer(&self) -> Arc<Mutex<AudioBuffer>> {
        Arc::clone(&self.buffer)
    }
}

pub fn start_microphone_capture(
    processor: Arc<AudioProcessor>,
) -> Result<AudioStream> {
    log::info!("Starting microphone capture for mobile");

    let host = cpal::default_host();
    let device = host
        .default_input_device()
        .ok_or_else(|| anyhow::anyhow!("No microphone found"))?;

    log::info!("Using audio device: {}", device.name()?);

    let config = device.default_input_config()?;
    log::info!("Audio config: {:?}", config);

    // Create stop channel
    let (stop_tx, mut stop_rx) = mpsc::unbounded_channel();

    // Clone processor for the stream callback
    let processor_clone = Arc::clone(&processor);

    let stream = device.build_input_stream(
        &config.into(),
        move |data: &[f32], _: &cpal::InputCallbackInfo| {
            // Check if we should stop
            if stop_rx.try_recv().is_ok() {
                log::info!("Stop signal received");
                return;
            }

            // Process audio chunk
            processor_clone.process_chunk(data);
        },
        |err| {
            log::error!("Audio stream error: {}", err);
        },
        None,
    )?;

    stream.play()?;
    log::info!("Audio stream started successfully");

    Ok(AudioStream {
        _stream: stream,
        stop_tx,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transcription_event_creation() {
        let event = TranscriptionEvent {
            text: "Hello world".to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            is_final: true,
        };
        assert_eq!(event.text, "Hello world");
        assert!(event.is_final);
    }
}
