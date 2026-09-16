/**
 * ============================================================================
 * NavigationBar.js - 共通ナビゲーションバーコンポーネント (Presentation Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Presentation = window.FormalEdu.Presentation || {};
  window.FormalEdu.Presentation.Components = window.FormalEdu.Presentation.Components || {};

  class NavigationBar {
    constructor(containerEl, progressUseCase, router) {
      this.containerEl = containerEl;
      this.progressUseCase = progressUseCase;
      this.router = router;
    }

    render(currentRoute, currentChapterMeta) {
      const stats = this.progressUseCase.getOverallStats(window.FormalEdu.Infrastructure.CURRICULUM_CHAPTERS);
      const isPortal = currentRoute === 'portal' || !currentRoute;

      this.containerEl.innerHTML = `
        <header class="app-header">
          <div class="header-left">
            <a href="#portal" class="header-logo">
              <span style="color: var(--accent-crimson); font-size: 1.2rem;">🚗</span>
              <span>状態遷移 × 要求論理 実践ハンズオン</span>
            </a>
            ${!isPortal && currentChapterMeta ? `
              <div class="header-nav">
                <a href="#portal" class="nav-link-portal">◂ Topへ</a>
                <span class="breadcrumb-separator">/</span>
                <span class="current-ch-title">${currentChapterMeta.badge}：${currentChapterMeta.title}</span>
              </div>
            ` : ''}
          </div>

          <div class="header-right">
            <div class="header-progress-box">
              <span>学習進捗: <b>${stats.completedCount} / ${stats.totalChapters}</b> (${stats.percent}%)</span>
              <div class="header-progress-bar-bg">
                <div class="header-progress-bar-fill" style="width: ${stats.percent}%;"></div>
              </div>
            </div>

            <button id="btn-run-all-tests" class="btn btn-secondary" style="padding: 5px 12px; font-size: 0.78rem;">
              全テスト実行
            </button>
          </div>
        </header>
      `;

      const testBtn = this.containerEl.querySelector('#btn-run-all-tests');
      if (testBtn) {
        testBtn.addEventListener('click', () => {
          this.runTests();
        });
      }
    }

    runTests() {
      if (window.FormalEdu.Presentation.Components.UnitTestModal && window.FormalEdu.Presentation.Components.UnitTestModal.instance) {
        window.FormalEdu.Presentation.Components.UnitTestModal.instance.open();
      } else {
        alert('ユニットテストモジュールが初期化されていません');
      }
    }
  }

  window.FormalEdu.Presentation.Components.NavigationBar = NavigationBar;
})();
