/**
 * ============================================================================
 * LocalStorageProgressRepository.ts - LocalStorageを用いた進捗保存 (Infrastructure Layer)
 * ============================================================================
 */

import { IProgressRepository, ChapterProgress } from '../../application/interfaces/IProgressRepository';

export class LocalStorageProgressRepository implements IProgressRepository {
  private readonly STORAGE_KEY = 'agy_formal_edu_progress_v1';

  public getProgress(chapterId: string): ChapterProgress | null {
    const all = this.getAllProgress();
    return all[chapterId] || null;
  }

  public getAllProgress(): Record<string, ChapterProgress> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return {};
      }
      const raw = window.localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read from localStorage', e);
      return {};
    }
  }

  public saveProgress(progress: ChapterProgress): void {
    try {
      const all = this.getAllProgress();
      all[progress.chapterId] = {
        ...progress,
        completedAt: new Date().toISOString(),
      };
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      }
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  public clearAll(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to clear localStorage', e);
    }
  }
}
