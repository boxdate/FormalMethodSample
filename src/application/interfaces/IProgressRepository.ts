/**
 * ============================================================================
 * IProgressRepository.ts - 学習進捗の永続化インターフェース (Application Layer)
 * ============================================================================
 */

export interface ChapterProgress {
  chapterId: string;       // 例: "ch1", "ch2"
  completed: boolean;      // 完了フラグ
  score?: number;          // ワークショップ正答数
  total?: number;          // ワークショップ設問数
  completedAt?: string;    // 完了日時
}

export interface IProgressRepository {
  getProgress(chapterId: string): ChapterProgress | null;
  getAllProgress(): Record<string, ChapterProgress>;
  saveProgress(progress: ChapterProgress): void;
  clearAll(): void;
}
