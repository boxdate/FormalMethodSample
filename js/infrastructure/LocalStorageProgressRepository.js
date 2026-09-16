/**
 * ============================================================================
 * LocalStorageProgressRepository.js - 進捗管理リポジトリ (Infrastructure Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Infrastructure = window.FormalEdu.Infrastructure || {};

  class LocalStorageProgressRepository {
    constructor() {
      this.STORAGE_KEY = 'agy_formal_edu_progress_v1';
      this.memoryFallback = {};
    }

    getProgress(chapterId) {
      const all = this.getAllProgress();
      return all[chapterId] || null;
    }

    getAllProgress() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = window.localStorage.getItem(this.STORAGE_KEY);
          if (raw) return JSON.parse(raw);
        }
      } catch (e) {
        // LocalStorageが使えない場合のフォールバック
      }
      return { ...this.memoryFallback };
    }

    saveProgress(progress) {
      const all = this.getAllProgress();
      all[progress.chapterId] = {
        ...progress,
        completedAt: new Date().toISOString(),
      };
      this.memoryFallback = all;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
        }
      } catch (e) {
        // ignore
      }
    }

    clearAll() {
      this.memoryFallback = {};
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(this.STORAGE_KEY);
        }
      } catch (e) {
        // ignore
      }
    }
  }

  window.FormalEdu.Infrastructure.LocalStorageProgressRepository = LocalStorageProgressRepository;
})();
