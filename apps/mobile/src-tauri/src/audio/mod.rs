// Audio capture for mobile
// This module handles microphone input on iOS and Android

pub mod mobile;

pub use mobile::start_microphone_capture;
pub use mobile::AudioStream;
