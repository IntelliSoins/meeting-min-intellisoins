// Audio capture for mobile
// This module handles microphone input on iOS and Android

pub mod mobile;
pub mod buffer;

pub use mobile::{start_microphone_capture, AudioStream, AudioProcessor};
pub use buffer::AudioBuffer;
