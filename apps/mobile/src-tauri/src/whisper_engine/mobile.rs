use anyhow::Result;
use std::path::{Path, PathBuf};

#[derive(Clone, Copy, Debug)]
pub enum ModelType {
    TinyEn,   // 40 MB
    BaseEn,   // 75 MB
    SmallEn,  // 200 MB
}

impl ModelType {
    pub fn from_str(s: &str) -> Result<Self> {
        match s.to_lowercase().as_str() {
            "tiny" | "tiny.en" => Ok(ModelType::TinyEn),
            "base" | "base.en" => Ok(ModelType::BaseEn),
            "small" | "small.en" => Ok(ModelType::SmallEn),
            _ => Err(anyhow::anyhow!("Unknown model type: {}", s)),
        }
    }

    pub fn filename(&self) -> &str {
        match self {
            ModelType::TinyEn => "ggml-tiny.en-q5_1.bin",
            ModelType::BaseEn => "ggml-base.en-q5_1.bin",
            ModelType::SmallEn => "ggml-small.en-q5_1.bin",
        }
    }

    pub fn download_url(&self) -> String {
        format!(
            "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/{}",
            self.filename()
        )
    }

    pub fn size_mb(&self) -> u64 {
        match self {
            ModelType::TinyEn => 40,
            ModelType::BaseEn => 75,
            ModelType::SmallEn => 200,
        }
    }
}

impl std::fmt::Display for ModelType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModelType::TinyEn => write!(f, "tiny.en"),
            ModelType::BaseEn => write!(f, "base.en"),
            ModelType::SmallEn => write!(f, "small.en"),
        }
    }
}

pub struct MobileWhisperEngine {
    model_type: ModelType,
    model_path: PathBuf,
    // We'll integrate with whisper-rs in the next step
    // For now, this is a placeholder structure
}

impl MobileWhisperEngine {
    pub async fn new(model_type: ModelType) -> Result<Self> {
        log::info!("Initializing MobileWhisperEngine with model: {}", model_type);

        // Ensure model is downloaded
        let model_path = ensure_model_downloaded(model_type).await?;

        Ok(Self {
            model_type,
            model_path,
        })
    }

    pub fn transcribe_chunk(&self, _audio: &[f32]) -> Result<String> {
        // TODO: Implement actual transcription using whisper-rs
        // This will delegate to the underlying Whisper engine
        log::debug!("Transcribing audio chunk (placeholder)");
        Ok("Transcription placeholder".to_string())
    }

    pub fn model_type(&self) -> ModelType {
        self.model_type
    }

    pub fn model_path(&self) -> &Path {
        &self.model_path
    }
}

fn get_models_dir() -> Result<PathBuf> {
    // Platform-specific model storage
    #[cfg(target_os = "ios")]
    {
        // iOS: Use app's documents directory
        let home = std::env::var("HOME")?;
        let path = PathBuf::from(home).join("Documents").join("models");
        std::fs::create_dir_all(&path)?;
        Ok(path)
    }

    #[cfg(target_os = "android")]
    {
        // Android: Use app's internal storage
        let data_dir = std::env::var("ANDROID_DATA")
            .unwrap_or_else(|_| "/data".to_string());
        let path = PathBuf::from(data_dir).join("models");
        std::fs::create_dir_all(&path)?;
        Ok(path)
    }

    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        // Desktop fallback for testing
        let path = PathBuf::from("./models");
        std::fs::create_dir_all(&path)?;
        Ok(path)
    }
}

async fn ensure_model_downloaded(model_type: ModelType) -> Result<PathBuf> {
    let models_dir = get_models_dir()?;
    let model_path = models_dir.join(model_type.filename());

    if !model_path.exists() {
        log::info!("Model not found, downloading: {}", model_type);
        download_model(model_type, &model_path).await?;
    } else {
        log::info!("Model already downloaded: {}", model_type);
    }

    Ok(model_path)
}

async fn download_model(model_type: ModelType, dest: &Path) -> Result<()> {
    use tokio::io::AsyncWriteExt;

    let url = model_type.download_url();
    log::info!("Downloading model from: {}", url);

    let client = reqwest::Client::new();
    let response = client.get(&url).send().await?;

    if !response.status().is_success() {
        return Err(anyhow::anyhow!(
            "Failed to download model: HTTP {}",
            response.status()
        ));
    }

    let total_size = response.content_length().unwrap_or(0);
    log::info!("Model size: {} MB", total_size / 1_000_000);

    // Create temporary file
    let temp_path = dest.with_extension("tmp");
    let mut file = tokio::fs::File::create(&temp_path).await?;
    let mut downloaded = 0u64;
    let mut stream = response.bytes_stream();

    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        file.write_all(&chunk).await?;
        downloaded += chunk.len() as u64;

        // Log progress every 10 MB
        if downloaded % 10_000_000 < chunk.len() as u64 {
            let progress = if total_size > 0 {
                (downloaded as f64 / total_size as f64 * 100.0) as u64
            } else {
                0
            };
            log::info!("Download progress: {}%", progress);
        }
    }

    file.flush().await?;
    drop(file);

    // Move temp file to final location
    tokio::fs::rename(&temp_path, dest).await?;
    log::info!("Model download complete: {}", dest.display());

    Ok(())
}
