export interface SongPreferences {
  topic: string;
  mood?: string;
  occasion?: string;
  preferred_instruments?: string;
  additional_notes?: string;
  input_language?: string;
}

export interface LyricsBlock {
  content: string;
  char_count: number;
  validation_warnings: string[];
}

export interface StyleBlock {
  content: string;
  char_count: number;
  validation_warnings: string[];
}

export interface GeneratedSong {
  id: string;
  title: string;
  lyrics: LyricsBlock;
  style: StyleBlock;
  generated_at: string;
  topic: string;
  is_valid: boolean;
  warnings: string[];
}

export interface SongGenerationResponse {
  success: boolean;
  song: GeneratedSong;
  error?: string;
}

export interface SunoTrack {
  id: string;
  title: string;
  audio_url: string;
  stream_audio_url: string;
  image_url: string;
  duration: number;
  tags: string;
}

export interface SunoSubmissionResponse {
  success: boolean;
  task_id: string;
  status: string;
  tracks: SunoTrack[];
  error?: string;
}
