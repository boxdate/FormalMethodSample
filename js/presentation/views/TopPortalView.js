/**
 * ============================================================================
 * TopPortalView.js - Topポータル・目次画面 (Presentation Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Presentation = window.FormalEdu.Presentation || {};
  window.FormalEdu.Presentation.Views = window.FormalEdu.Presentation.Views || {};

  class TopPortalView {
    constructor(containerEl, progressUseCase, router) {
      this.containerEl = containerEl;
      this.progressUseCase = progressUseCase;
      this.router = router;
    }

    render() {
      const chapters = window.FormalEdu.Infrastructure.CURRICULUM_CHAPTERS;
      const progressMap = this.progressUseCase.getAllProgress();
      const stats = this.progressUseCase.getOverallStats(chapters);

      this.containerEl.innerHTML = `
        <!-- ヒーローセクション -->
        <section class="portal-hero">
          <div class="hero-tag">車載パワーウィンドウで学ぶ 状態遷移 × 要求論理</div>
          <h1 class="hero-title">
            要求文書を読めるように、書けるようになろう！ ――<br>
            有向グラフとブール論理で解き明かす「状態遷移」の思考法
          </h1>
          <p class="hero-subtitle">
            「仕様書の文章をどう読めばモデルやコードに落とし込めるのか？」「抜け漏れのない要求はどう書けばいいのか？」<br>
            自然言語からトリガーとアクションを抜き出し、世界の真偽値（True/False）の変化を捉えれば、
            有向グラフとしての美しい状態マシンが自然と立ち上がり、BDDやEARS記法もスラスラ読み書きできるようになります。
          </p>

          <div class="hero-stats">
            <div class="hero-stat-item">
              <span class="hero-stat-num">5</span>
              <span class="hero-stat-label">全 5 ステップ</span>
            </div>
            <div class="hero-stat-item">
              <span class="hero-stat-num">約 70 分</span>
              <span class="hero-stat-label">想定学習時間</span>
            </div>
            <div class="hero-stat-item">
              <span class="hero-stat-num">${stats.completedCount} / ${stats.totalChapters}</span>
              <span class="hero-stat-label">完了ステップ</span>
            </div>
            <div class="hero-stat-item">
              <span class="hero-stat-num">100%</span>
              <span class="hero-stat-label">ブラウザ完結</span>
            </div>
          </div>
        </section>

        <!-- ロードマップセクション -->
        <section class="portal-roadmap-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">🗺️ カリキュラム・ロードマップ</h2>
              <div class="section-subtitle">Step 1から順を追って進めることで、自然と言語化とモデリングのメンタルモデルが身につきます</div>
            </div>
          </div>

          <div class="roadmap-flow">
            ${chapters.map((ch, idx) => {
              const isCompleted = progressMap[ch.id] && progressMap[ch.id].completed;
              return `
                <div class="roadmap-step ${isCompleted ? 'completed' : ''}" onclick="window.FormalEdu.App.router.navigate('${ch.id}')">
                  <div class="roadmap-node-circle">${isCompleted ? '✓' : ch.number}</div>
                  <div class="roadmap-step-title">${ch.badge}</div>
                  <div class="roadmap-step-desc">${ch.durationMinutes}分</div>
                </div>
                ${idx < chapters.length - 1 ? `<div class="roadmap-edge-arrow"></div>` : ''}
              `;
            }).join('')}
          </div>
        </section>

        <!-- チャプターカード一覧 -->
        <section>
          <div class="section-header">
            <div>
              <h2 class="section-title">📚 カリキュラム一覧</h2>
              <div class="section-subtitle">学びたいステップを選択してワークショップを開始してください</div>
            </div>
          </div>

          <div class="chapters-grid">
            ${chapters.map(ch => {
              const isCompleted = progressMap[ch.id] && progressMap[ch.id].completed;
              const levelBadgeClass = ch.level === '入門' ? 'badge-blue' : ch.level === '基礎' ? 'badge-green' : ch.level === '実践' ? 'badge-orange' : 'badge-purple';

              return `
                <div class="chapter-card ${isCompleted ? 'is-completed' : ''}">
                  <div class="card-top">
                    <div class="card-meta">
                      <span class="badge ${levelBadgeClass}">${ch.level}</span>
                      <span class="badge badge-blue">${ch.badge}</span>
                      <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">⏱ ${ch.durationMinutes}分</span>
                    </div>

                    <h3 class="card-title">${ch.title}</h3>
                    <div class="card-subtitle">${ch.subtitle}</div>
                    <p class="card-summary">${ch.summary}</p>

                    <ul class="card-points">
                      ${ch.learningPoints.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                  </div>

                  <div class="card-bottom">
                    <span class="card-info-item">
                      ${isCompleted ? '✓ 完了' : '未完了'}
                    </span>
                    <button class="btn btn-primary" onclick="window.FormalEdu.App.router.navigate('${ch.id}')">
                      ${isCompleted ? 'もう一度復習する ↻' : '学習を開始する ➔'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- ツールバー -->
        <div class="portal-footer-tools">
          <div style="font-size: 0.82rem; color: var(--text-muted);">
            学習進捗はお使いのブラウザに自動保存されます
          </div>
          <button id="btn-reset-progress" class="btn btn-secondary" style="font-size: 0.78rem;">
            進捗をリセット
          </button>
        </div>
      `;

      const resetBtn = this.containerEl.querySelector('#btn-reset-progress');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('学習進捗をすべてリセットしますか？')) {
            this.progressUseCase.resetAll();
            this.render();
            // ナビゲーションバーの再描画
            if (window.FormalEdu.App && window.FormalEdu.App.navBar) {
              window.FormalEdu.App.navBar.render('portal', null);
            }
          }
        });
      }
    }
  }

  window.FormalEdu.Presentation.Views.TopPortalView = TopPortalView;
})();
