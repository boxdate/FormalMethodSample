/**
 * ============================================================================
 * Chapter2BooleanView.js - Step 2: 真偽値化ワークショップ (Presentation Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Presentation = window.FormalEdu.Presentation || {};
  window.FormalEdu.Presentation.Views = window.FormalEdu.Presentation.Views || {};

  class Chapter2BooleanView {
    constructor(containerEl, progressUseCase, booleanUseCase, router) {
      this.containerEl = containerEl;
      this.progressUseCase = progressUseCase;
      this.booleanUseCase = booleanUseCase;
      this.router = router;
      this.userValues = {}; // { questionId: { varId: boolean } }
    }

    render(chapterMeta) {
      this.chapterMeta = chapterMeta;
      const questions = chapterMeta.questions || [];

      this.containerEl.innerHTML = `
        <div class="workbook-container">
          <!-- ヘッダー -->
          <div class="workbook-header">
            <div class="workbook-header-top">
              <span class="badge badge-green">${chapterMeta.badge}</span>
              <span style="font-size: 0.8rem; color: var(--text-dim);">想定時間: ${chapterMeta.durationMinutes}分</span>
            </div>
            <h1 class="workbook-title">${chapterMeta.title}</h1>
            <div class="workbook-subtitle">${chapterMeta.subtitle}</div>
            <div class="workbook-intro-box">
              💡 <b>若手向けアドバイス: 「いきなり状態遷移を考えるな！」</b><br>
              「手動上昇状態へ遷移する」と考えると、状態数が爆発して頭が破綻します。<br>
              アクションとは、<b>「ある命題（状態変数）を True または False に書き換える代入文」</b>だと捉えるクセをつけましょう。
            </div>
          </div>

          <!-- ワークショップ設問 -->
          ${questions.map((q, qIdx) => `
            <div class="question-card" id="card-${q.id}">
              <div class="question-header">
                <div class="question-title">設問 ${qIdx + 1}: 【${q.actionText}】のブール代入</div>
                <span class="badge badge-blue">True / False を選択</span>
              </div>

              <div>
                <div style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 8px;">
                  このアクションが実行された時、各変数は <b>TRUE</b> になるべきでしょうか？ <b>FALSE</b> になるべきでしょうか？
                </div>

                <table class="boolean-table">
                  <thead>
                    <tr>
                      <th style="width: 160px;">状態変数 (ID)</th>
                      <th>意味・役割</th>
                      <th style="width: 140px; text-align: center;">代入値</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${q.variables.map(v => `
                      <tr>
                        <td class="variable-name-cell">${v.id}</td>
                        <td class="variable-desc-cell">${v.name}</td>
                        <td style="text-align: center;">
                          <div class="toggle-group">
                            <button class="toggle-btn" id="btn-${q.id}-${v.id}-true" onclick="window.FormalEdu.Presentation.Views.Chapter2BooleanView.setVar('${q.id}', '${v.id}', true)">
                              TRUE
                            </button>
                            <button class="toggle-btn" id="btn-${q.id}-${v.id}-false" onclick="window.FormalEdu.Presentation.Views.Chapter2BooleanView.setVar('${q.id}', '${v.id}', false)">
                              FALSE
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- フィードバックエリア -->
              <div class="feedback-box" id="feedback-${q.id}"></div>

              <div>
                <button class="btn btn-primary" onclick="window.FormalEdu.Presentation.Views.Chapter2BooleanView.checkAnswer('${q.id}')">
                  ✓ 判定する
                </button>
              </div>
            </div>
          `).join('')}

          <!-- ボトムナビゲーション -->
          <div class="workbook-bottom-nav">
            <button class="btn btn-secondary" onclick="window.FormalEdu.App.router.navigate('ch1')">
              ◂ Step 1: 仕様解体へ戻る
            </button>
            <button id="btn-next-ch3" class="btn btn-primary" onclick="window.FormalEdu.App.router.navigate('ch3')">
              Step 3: 状態と有向グラフが立ち上がる瞬間 ➔
            </button>
          </div>
        </div>
      `;

      questions.forEach(q => {
        this.userValues[q.id] = {};
        q.variables.forEach(v => {
          this.userValues[q.id][v.id] = false; // デフォルト
          const falseBtn = document.getElementById(`btn-${q.id}-${v.id}-false`);
          if (falseBtn) falseBtn.classList.add('active-false');
        });
      });

      window.FormalEdu.Presentation.Views.Chapter2BooleanView.activeInstance = this;
    }

    static setVar(questionId, varId, value) {
      const self = window.FormalEdu.Presentation.Views.Chapter2BooleanView.activeInstance;
      if (!self) return;

      self.userValues[questionId][varId] = value;

      const trueBtn = document.getElementById(`btn-${questionId}-${varId}-true`);
      const falseBtn = document.getElementById(`btn-${questionId}-${varId}-false`);

      if (trueBtn && falseBtn) {
        if (value === true) {
          trueBtn.classList.add('active-true');
          falseBtn.classList.remove('active-false');
        } else {
          trueBtn.classList.remove('active-true');
          falseBtn.classList.add('active-false');
        }
      }
    }

    static checkAnswer(questionId) {
      const self = window.FormalEdu.Presentation.Views.Chapter2BooleanView.activeInstance;
      if (!self) return;

      const question = self.chapterMeta.questions.find(q => q.id === questionId);
      if (!question) return;

      const result = self.booleanUseCase.evaluateQuestion(question, self.userValues[questionId]);
      const cardEl = document.getElementById(`card-${questionId}`);
      const feedbackEl = document.getElementById(`feedback-${questionId}`);

      if (feedbackEl) {
        feedbackEl.classList.remove('success', 'error', 'show');
        feedbackEl.classList.add('show');

        if (result.isAllCorrect) {
          cardEl.classList.add('is-correct');
          feedbackEl.classList.add('success');
          feedbackEl.innerHTML = `
            <div class="feedback-box-title">🎉 完璧です！論理がスッキリ整理できました！</div>
            <div style="margin-top: 6px;">
              ${result.details.map(d => `
                <div style="font-size: 0.82rem; margin-bottom: 4px;">
                  ・<b>${d.varId} := ${d.actual}</b> ➡ ${d.reason}
                </div>
              `).join('')}
            </div>
            <div style="margin-top: 8px; font-weight: bold; color: var(--accent-blue);">
              👉 「状態の遷移」ではなく「変数の代入」として捉えたことで、迷いが一切なくなりましたね！
            </div>
          `;
          self.progressUseCase.markChapterComplete('ch2');
        } else {
          feedbackEl.classList.add('error');
          feedbackEl.innerHTML = `
            <div class="feedback-box-title">⚠️ もう少しです！（${result.correctCount} / ${result.totalVars} 正解）</div>
            <div>
              もう一度、不要なフラグが立ちっぱなしになっていないか、または必要なフラグがTrueになっているか確認してみましょう。
            </div>
          `;
        }
      }
    }
  }

  window.FormalEdu.Presentation.Views.Chapter2BooleanView = Chapter2BooleanView;
})();
