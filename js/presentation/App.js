/**
 * ============================================================================
 * App.js - アプリケーション・エントリーポイント (Presentation Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Presentation = window.FormalEdu.Presentation || {};

  const { LocalStorageProgressRepository, HashRouter, CURRICULUM_CHAPTERS } = window.FormalEdu.Infrastructure;
  const { ProgressUseCase, ExtractRequirementUseCase, BooleanMappingUseCase, GraphDerivationUseCase } = window.FormalEdu.Application;
  const { NavigationBar } = window.FormalEdu.Presentation.Components;
  const {
    TopPortalView,
    Chapter1ExtractionView,
    Chapter2BooleanView,
    Chapter3GraphDerivationView,
    Chapter4SimulatorView,
    Chapter5ConclusionView,
  } = window.FormalEdu.Presentation.Views;

  class Application {
    constructor() {
      // 1. インフラ層初期化
      this.progressRepo = new LocalStorageProgressRepository();
      this.router = new HashRouter();

      // 2. アプリケーション層初期化
      this.progressUseCase = new ProgressUseCase(this.progressRepo);
      this.extractUseCase = new ExtractRequirementUseCase();
      this.booleanUseCase = new BooleanMappingUseCase();
      this.derivationUseCase = new GraphDerivationUseCase();

      // DOM要素
      this.headerContainer = document.getElementById('app-header-container');
      this.mainContainer = document.getElementById('app-main-container');

      // 3. プレゼンテーション層初期化
      this.navBar = new NavigationBar(this.headerContainer, this.progressUseCase, this.router);
      this.portalView = new TopPortalView(this.mainContainer, this.progressUseCase, this.router);
      this.ch1View = new Chapter1ExtractionView(this.mainContainer, this.progressUseCase, this.extractUseCase, this.router);
      this.ch2View = new Chapter2BooleanView(this.mainContainer, this.progressUseCase, this.booleanUseCase, this.router);
      this.ch3View = new Chapter3GraphDerivationView(this.mainContainer, this.progressUseCase, this.derivationUseCase, this.router);
      this.ch4View = new Chapter4SimulatorView(this.mainContainer, this.progressUseCase, this.router);
      this.ch5View = new Chapter5ConclusionView(this.mainContainer, this.progressUseCase, this.router);

      // ビューのマップ (全Chapter登録完了)
      this.views = {
        portal: this.portalView,
        ch1: this.ch1View,
        ch2: this.ch2View,
        ch3: this.ch3View,
        ch4: this.ch4View,
        ch5: this.ch5View,
      };

      this.setupRoutes();
    }

    registerView(routeId, viewInstance) {
      this.views[routeId] = viewInstance;
    }

    setupRoutes() {
      // ポータルルート
      this.router.register('portal', () => {
        this.navBar.render('portal', null);
        this.portalView.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // 各Chapterルート (ch1 〜 ch5)
      CURRICULUM_CHAPTERS.forEach(ch => {
        this.router.register(ch.id, () => {
          this.navBar.render(ch.id, ch);
          if (this.views[ch.id]) {
            this.views[ch.id].render(ch);
          } else {
            // ビュー未実装時のプレースホルダー
            this.mainContainer.innerHTML = `
              <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 40px; text-align: center;">
                <div class="badge badge-blue" style="margin-bottom: 12px;">${ch.badge}</div>
                <h2 style="color: var(--text-white); margin-bottom: 12px;">${ch.title}</h2>
                <p style="color: var(--text-dim); max-width: 600px; margin: 0 auto 24px;">${ch.summary}</p>
                <div style="padding: 20px; background: var(--bg-main); border-radius: 8px; max-width: 400px; margin: 0 auto 24px; color: var(--accent-orange);">
                  🚧 このチャプターのワークショップ画面は Phase 3 / 4 で実装中です
                </div>
                <button class="btn btn-secondary" onclick="window.FormalEdu.App.router.navigate('portal')">
                  ◂ 目次ポータルへ戻る
                </button>
              </div>
            `;
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });

      this.router.setDefault('portal');
    }

    start() {
      this.router.init();
    }
  }

  // アプリケーション起動
  document.addEventListener('DOMContentLoaded', () => {
    window.FormalEdu.App = new Application();
    window.FormalEdu.App.start();
  });
})();
