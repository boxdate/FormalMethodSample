/**
 * ============================================================================
 * Chapter1ExtractionView.js - Step 1: 仕様解体ワークショップ (Presentation Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Presentation = window.FormalEdu.Presentation || {};
  window.FormalEdu.Presentation.Views = window.FormalEdu.Presentation.Views || {};

  class Chapter1ExtractionView {
    constructor(containerEl, progressUseCase, extractUseCase, router) {
      this.containerEl = containerEl;
      this.progressUseCase = progressUseCase;
      this.extractUseCase = extractUseCase;
      this.router = router;
      this.userSelections = {}; // { questionId: { tokenIndex: 'trigger' | 'action' } }
    }

    render(chapterMeta) {
      this.chapterMeta = chapterMeta;
      const questions = chapterMeta.questions || [];

      this.containerEl.innerHTML = `
        <div class="workbook-container">
          <!-- ヘッダー -->
          <div class="workbook-header">
            <div class="workbook-header-top">
              <span class="badge badge-blue">${chapterMeta.badge}</span>
              <span style="font-size: 0.8rem; color: var(--text-dim);">想定時間: ${chapterMeta.durationMinutes}分</span>
            </div>
            <h1 class="workbook-title">${chapterMeta.title}</h1>
            <div class="workbook-subtitle">${chapterMeta.subtitle}</div>
            <div class="workbook-intro-box">
              💡 <b>若手向けアドバイス:</b> 仕様書を読んでいきなり「状態マシン図」を描こうとすると、頭がパンクします。<br>
              まずは自然言語の文章を、<b>「もし〜なら（トリガー・前提・事象）」</b>と<b>「〜する（アクション・結果）」</b>の2つに仕分けるクセをつけましょう。
            </div>
          </div>

          <!-- ワークショップ設問 -->
          ${questions.map((q, qIdx) => `
            <div class="question-card" id="card-${q.id}">
              <div class="question-header">
                <div class="question-title">設問 ${qIdx + 1}: 【${q.specId}】の解体ワーク</div>
                <span class="badge badge-orange">クリックで分類</span>
              </div>

              <div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 6px;">原文の仕様書:</div>
                <div class="spec-quote-box">「${q.rawText}」</div>
              </div>

              <div>
                <div style="font-size: 0.84rem; color: var(--text-main); margin-bottom: 8px;">
                  下の各フレーズをクリックして、<b>「トリガー（青）」</b>または<b>「アクション（橙）」</b>に分類してください：
                </div>
                <div class="token-container" id="tokens-${q.id}">
                  ${q.tokens.map((t, tIdx) => `
                    <div class="token-item" id="token-${q.id}-${tIdx}" onclick="window.FormalEdu.Presentation.Views.Chapter1ExtractionView.handleTokenClick('${q.id}', ${tIdx})">
                      <span class="token-text">${t.text}</span>
                      <span class="token-tag" id="tag-${q.id}-${tIdx}">未選択</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- フィードバックエリア -->
              <div class="feedback-box" id="feedback-${q.id}"></div>

              <div>
                <button class="btn btn-primary" onclick="window.FormalEdu.Presentation.Views.Chapter1ExtractionView.checkAnswer('${q.id}')">
                  ✓ 判定する
                </button>
              </div>
            </div>
          `).join('')}

          <!-- ボトムナビゲーション -->
          <div class="workbook-bottom-nav">
            <button class="btn btn-secondary" onclick="window.FormalEdu.App.router.navigate('portal')">
              ◂ Topへ戻る
            </button>
            <button id="btn-next-ch2" class="btn btn-primary" onclick="window.FormalEdu.App.router.navigate('ch2')">
              Step 2: アクションを「True / False」で捉える ➔
            </button>
          </div>
        </div>
      `;

      // ユーザー選択状態の初期化
      questions.forEach(q => {
        this.userSelections[q.id] = {};
      });

      // グローバルインスタンスの参照保持（インラインonclick対応）
      window.FormalEdu.Presentation.Views.Chapter1ExtractionView.activeInstance = this;
    }

    static handleTokenClick(questionId, tokenIdx) {
      const self = window.FormalEdu.Presentation.Views.Chapter1ExtractionView.activeInstance;
      if (!self) return;

      const current = self.userSelections[questionId][tokenIdx];
      let next = 'trigger';
      if (current === 'trigger') next = 'action';
      else if (current === 'action') next = null;

      self.userSelections[questionId][tokenIdx] = next;

      const tokenEl = document.getElementById(`token-${questionId}-${tokenIdx}`);
      const tagEl = document.getElementById(`tag-${questionId}-${tokenIdx}`);

      if (tokenEl && tagEl) {
        tokenEl.classList.remove('selected-trigger', 'selected-action');
        tagEl.classList.remove('trigger', 'action');

        if (next === 'trigger') {
          tokenEl.classList.add('selected-trigger');
          tagEl.classList.add('trigger');
          tagEl.textContent = 'トリガー (青)';
        } else if (next === 'action') {
          tokenEl.classList.add('selected-action');
          tagEl.classList.add('action');
          tagEl.textContent = 'アクション (橙)';
        } else {
          tagEl.textContent = '未選択';
        }
      }
    }

    static checkAnswer(questionId) {
      const self = window.FormalEdu.Presentation.Views.Chapter1ExtractionView.activeInstance;
      if (!self) return;

      const question = self.chapterMeta.questions.find(q => q.id === questionId);
      if (!question) return;

      const result = self.extractUseCase.evaluateQuestion(question, self.userSelections[questionId]);
      const cardEl = document.getElementById(`card-${questionId}`);
      const feedbackEl = document.getElementById(`feedback-${questionId}`);

      if (feedbackEl) {
        feedbackEl.classList.remove('success', 'error', 'show');
        feedbackEl.classList.add('show');

        if (result.isAllCorrect) {
          cardEl.classList.add('is-correct');
          feedbackEl.classList.add('success');
          feedbackEl.innerHTML = `
            <div class="feedback-box-title">🎉 正解！お見事です！</div>
            <div>
              すべて正しく分解できました。<br>
              ・<b>トリガー</b>: 「前提状態」「操作事象」「ガード条件」が揃って初めて動作が許可されます。<br>
              ・<b>アクション</b>: システムが外部（モータ）に対して実行する働きかけです。<br>
              この2つが分かれば、要求仕様の半分は解読できたも同然です！
            </div>
          `;
          self.progressUseCase.markChapterComplete('ch1');
        } else {
          feedbackEl.classList.add('error');
          feedbackEl.innerHTML = `
            <div class="feedback-box-title">⚠️ もう少しです！（${result.correctCount} / ${result.totalTokens} 正解）</div>
            <div>
              ${question.hint}<br>
              「もし〜なら」「〜のとき」「〜でなければ」はすべてトリガー側に分類されます。もう一度試してみましょう！
            </div>
          `;
        }
      }
    }
  }

  window.FormalEdu.Presentation.Views.Chapter1ExtractionView = Chapter1ExtractionView;
})();
