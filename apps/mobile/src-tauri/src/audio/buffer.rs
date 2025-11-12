use std::collections::VecDeque;

const SAMPLE_RATE: u32 = 16000; // Whisper expects 16kHz
const BUFFER_DURATION_SECS: usize = 30; // Buffer 30 seconds of audio
const VAD_THRESHOLD: f32 = 0.02; // Voice activity threshold
const MIN_SPEECH_DURATION_MS: usize = 500; // Minimum 500ms of speech to transcribe

pub struct AudioBuffer {
    buffer: VecDeque<f32>,
    max_samples: usize,
    speech_start: Option<usize>,
    samples_since_speech: usize,
}

impl AudioBuffer {
    pub fn new() -> Self {
        let max_samples = SAMPLE_RATE as usize * BUFFER_DURATION_SECS;
        Self {
            buffer: VecDeque::with_capacity(max_samples),
            max_samples,
            speech_start: None,
            samples_since_speech: 0,
        }
    }

    /// Add audio samples to buffer
    pub fn push_samples(&mut self, samples: &[f32]) {
        for &sample in samples {
            if self.buffer.len() >= self.max_samples {
                self.buffer.pop_front();
            }
            self.buffer.push_back(sample);
        }
    }

    /// Check if buffer contains speech (VAD)
    pub fn has_speech(&self, samples: &[f32]) -> bool {
        let rms = calculate_rms(samples);
        rms > VAD_THRESHOLD
    }

    /// Update speech detection state
    pub fn update_speech_state(&mut self, has_speech: bool) {
        if has_speech {
            if self.speech_start.is_none() {
                self.speech_start = Some(self.buffer.len());
            }
            self.samples_since_speech = 0;
        } else {
            self.samples_since_speech += 1;
        }
    }

    /// Check if we should transcribe now
    /// Returns true if we have enough speech and silence after
    pub fn should_transcribe(&self) -> bool {
        if let Some(start) = self.speech_start {
            let speech_samples = self.buffer.len() - start;
            let speech_duration_ms = (speech_samples * 1000) / SAMPLE_RATE as usize;

            // Check if we have minimum speech duration
            if speech_duration_ms < MIN_SPEECH_DURATION_MS {
                return false;
            }

            // Check if we have silence after speech (1 second)
            let silence_samples = SAMPLE_RATE as usize; // 1 second
            self.samples_since_speech >= silence_samples
        } else {
            false
        }
    }

    /// Get audio for transcription and reset buffer
    pub fn extract_for_transcription(&mut self) -> Vec<f32> {
        let audio: Vec<f32> = self.buffer.iter().copied().collect();
        self.buffer.clear();
        self.speech_start = None;
        self.samples_since_speech = 0;
        audio
    }

    /// Get current buffer size in seconds
    pub fn duration_secs(&self) -> f32 {
        self.buffer.len() as f32 / SAMPLE_RATE as f32
    }

    /// Clear the buffer
    pub fn clear(&mut self) {
        self.buffer.clear();
        self.speech_start = None;
        self.samples_since_speech = 0;
    }
}

impl Default for AudioBuffer {
    fn default() -> Self {
        Self::new()
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
    fn test_audio_buffer_push() {
        let mut buffer = AudioBuffer::new();
        let samples = vec![0.1, 0.2, 0.3];
        buffer.push_samples(&samples);
        assert_eq!(buffer.buffer.len(), 3);
    }

    #[test]
    fn test_vad_detection() {
        let buffer = AudioBuffer::new();

        // Silence
        let silence = vec![0.0; 100];
        assert!(!buffer.has_speech(&silence));

        // Speech
        let speech = vec![0.1; 100];
        assert!(buffer.has_speech(&speech));
    }

    #[test]
    fn test_buffer_max_capacity() {
        let mut buffer = AudioBuffer::new();
        let max_samples = buffer.max_samples;

        // Fill beyond capacity
        let samples = vec![0.1; max_samples + 1000];
        buffer.push_samples(&samples);

        // Should not exceed max
        assert_eq!(buffer.buffer.len(), max_samples);
    }
}
