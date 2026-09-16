/**
 * ============================================================================
 * ProgressUseCase.js - 学習進捗管理ユースケース (Application Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Application = window.FormalEdu.Application || {};

  class ProgressUseCase {
    constructor(progressRepository) {
      this.repository = progressRepository;
    }

    getChapterProgress(chapterId) {
      return this.repository.getProgress(chapterId);
    }

    getAllProgress() {
      return this.repository.getAllProgress();
    }

    markChapterComplete(chapterId, score, total) {
      this.repository.saveProgress({
        chapterId,
        completed: true,
        score: score !== undefined ? score : undefined,
        total: total !== undefined ? total : undefined,
      });
    }

    getOverallStats(chapters) {
      const all = this.getAllProgress();
      const totalChapters = chapters.length;
      let completedCount = 0;

      for (const ch of chapters) {
        if (all[ch.id] && all[ch.id].completed) {
          completedCount++;
        }
      }

      const percent = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
      return {
        totalChapters,
        completedCount,
        percent,
      };
    }

    resetAll() {
      this.repository.clearAll();
    }
  }

  window.FormalEdu.Application.ProgressUseCase = ProgressUseCase;
})();
