// Shared types
export interface Meeting {
  id: string;
  title: string;
  created_at: string;
  transcript?: string;
  summary?: string;
}

export interface TranscriptUpdate {
  text: string;
  timestamp: string;
  is_final: boolean;
}

export interface Summary {
  [key: string]: {
    title: string;
    blocks: Block[];
  };
}

export interface Block {
  id: string;
  type: 'text' | 'bullet';
  content: string;
}

export type Platform = 'desktop' | 'ios' | 'android';
export type RecordingMode = 'local' | 'cloud';
