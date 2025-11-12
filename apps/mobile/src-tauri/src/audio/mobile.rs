use anyhow::Result;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::Stream;

pub struct AudioStream {
    _stream: Stream,
}

pub fn start_microphone_capture() -> Result<AudioStream> {
    log::info!("Starting microphone capture for mobile");

    let host = cpal::default_host();
    let device = host
        .default_input_device()
        .ok_or_else(|| anyhow::anyhow!("No microphone found"))?;

    log::info!("Using audio device: {}", device.name()?);

    let config = device.default_input_config()?;
    log::info!("Audio config: {:?}", config);

    let stream = device.build_input_stream(
        &config.into(),
        move |data: &[f32], _: &cpal::InputCallbackInfo| {
            // TODO: Process audio chunk
            // - Apply VAD (Voice Activity Detection) to filter silence
            // - Buffer audio until we have ~30 seconds
            // - Send to Whisper for transcription
            process_audio_chunk(data);
        },
        |err| {
            log::error!("Audio stream error: {}", err);
        },
        None,
    )?;

    stream.play()?;
    log::info!("Audio stream started successfully");

    Ok(AudioStream { _stream: stream })
}

fn process_audio_chunk(data: &[f32]) {
    // Placeholder for audio processing
    // In the full implementation, this will:
    // 1. Check if audio contains speech (VAD)
    // 2. Buffer speech segments
    // 3. Send to Whisper when buffer is full

    log::trace!("Processing audio chunk of {} samples", data.len());

    // Simple VAD placeholder: check RMS energy
    let rms = calculate_rms(data);
    let threshold = 0.02; // Adjust based on testing

    if rms > threshold {
        log::debug!("Speech detected (RMS: {:.4})", rms);
        // TODO: Add to buffer and transcribe
    }
}

fn calculate_rms(samples: &[f32]) -> f32 {
    if samples.is_empty() {
        return 0.0;
    }

    let sum_squares: f32 = samples.iter().map(|&s| s * s).sum();
    (sum_squares / samples.len() as f32).sqrt()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_rms() {
        let samples = vec![0.1, 0.2, 0.3, 0.4, 0.5];
        let rms = calculate_rms(&samples);
        assert!(rms > 0.0);
        assert!(rms < 1.0);
    }

    #[test]
    fn test_calculate_rms_silence() {
        let samples = vec![0.0; 100];
        let rms = calculate_rms(&samples);
        assert_eq!(rms, 0.0);
    }
}
