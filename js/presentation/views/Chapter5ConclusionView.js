/**
 * ============================================================================
 * Chapter5ConclusionView.js - Step 5: BDD / EARS 種明かし (Presentation Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Presentation = window.FormalEdu.Presentation || {};
  window.FormalEdu.Presentation.Views = window.FormalEdu.Presentation.Views || {};

  class Chapter5ConclusionView {
    constructor(containerEl, progressUseCase, router) {
      this.containerEl = containerEl;
      this.progressUseCase = progressUseCase;
      this.router = router;
    }

    render(chapterMeta) {
      this.chapterMeta = chapterMeta;

      this.containerEl.innerHTML = `
        <div class="workbook-container">
          <!-- ヘッダー -->
          <div class="workbook-header">
            <div class="workbook-header-top">
              <span class="badge badge-orange">${chapterMeta.badge}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">想定時間: ${chapterMeta.durationMinutes}分</span>
            </div>
            <h1 class="workbook-title">${chapterMeta.title}</h1>
            <div class="workbook-subtitle">${chapterMeta.subtitle}</div>
            <div class="workbook-intro-box">
              🎉 <b>お疲れ様でした！</b><br>
              ここまで「トリガー」「True/False代入」「有向グラフ」を体験してきたあなたには、もう業界標準の要求仕様記法である <b>BDD (振舞駆動開発)</b> や <b>EARS記法</b> のアレルギーは一切ありません。<br>
              なぜなら、あなたはすでに<b>それらの背後にある『論理メンタルモデル』を完全にマスターしたから</b>です。
            </div>
          </div>

          <!-- 種明かし 1: BDD (Given-When-Then) との完全一致 -->
          <div class="question-card">
            <div class="question-header">
              <div class="question-title">💡 種明かし ①: BDD (Given - When - Then) の正体</div>
              <span class="badge badge-blue">テスト駆動・要求定義の標準</span>
            </div>

            <p style="font-size: 0.88rem; color: var(--text-main); line-height: 1.7;">
              若手がBDDで「GivenとWhenの書き分けがわからない…」と悩むのは、文章の言い回しから入ってしまうためです。<br>
              本教材で学んだ通り、<b>世界を変数の真偽値とトリガー事象で捉えれば一目瞭然</b>となります：
            </p>

            <table class="boolean-table" style="margin-top: 14px;">
              <thead>
                <tr>
                  <th style="width: 140px;">BDD (Gherkin)</th>
                  <th style="width: 200px;">本教材でのメンタルモデル</th>
                  <th>パワーウィンドウでの具体例 (REQ-002)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="color: var(--accent-blue); font-weight: bold;">Given (前提)</td>
                  <td><b>今、どの変数が True か？</b></td>
                  <td><code>is_stopped == TRUE ∧ positionPercent &lt; 100%</code></td>
                </tr>
                <tr>
                  <td style="color: var(--accent-gold); font-weight: bold;">When (契機)</td>
                  <td><b>どのトリガー事象が起きたか？</b></td>
                  <td><code>SW_MANUAL_UP (UP短押し) が押された瞬間</code></td>
                </tr>
                <tr>
                  <td style="color: var(--accent-red); font-weight: bold;">Then (結果)</td>
                  <td><b>どの変数を True/False に変えるか？</b></td>
                  <td><code>motor_up := TRUE ∧ is_auto := FALSE</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 種明かし 2: EARS記法との完全一致 -->
          <div class="question-card">
            <div class="question-header">
              <div class="question-title">💡 種明かし ②: EARS記法の5構文の正体</div>
              <span class="badge badge-green">NASA・車載安全規格で重用される要求構文</span>
            </div>

            <p style="font-size: 0.88rem; color: var(--text-main); line-height: 1.7;">
              EARS (Easy Approach to Requirements Syntax) も、シミュレータで検証した「前提」「トリガー」「アクション」「不変条件」を英語の定型文型に写像したものです：
            </p>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 14px;">
              <div style="background: var(--bg-card); border-left: 4px solid var(--accent-blue); border-top: 1px solid var(--border-book); border-right: 1px solid var(--border-book); border-bottom: 1px solid var(--border-book); padding: 12px 16px; border-radius: var(--radius-sm);">
                <div style="font-weight: bold; color: var(--accent-blue); font-size: 0.88rem;">1. State-driven (状態駆動要求)</div>
                <div style="font-family: var(--font-mono); font-size: 0.84rem; margin: 4px 0; color: var(--text-main);">
                  <b>While</b> &lt;前提変数がTrueの間&gt;, the system shall &lt;アクション(True/False代入)&gt;
                </div>
                <div style="font-size: 0.76rem; color: var(--text-muted);">
                  例: 「窓が上限端に達していない間（While）、システムはモータ上昇駆動を維持しなければならない（shall）」
                </div>
              </div>

              <div style="background: var(--bg-card); border-left: 4px solid var(--accent-gold); border-top: 1px solid var(--border-book); border-right: 1px solid var(--border-book); border-bottom: 1px solid var(--border-book); padding: 12px 16px; border-radius: var(--radius-sm);">
                <div style="font-weight: bold; color: var(--accent-gold); font-size: 0.88rem;">2. Event-driven (事象駆動要求)</div>
                <div style="font-family: var(--font-mono); font-size: 0.84rem; margin: 4px 0; color: var(--text-main);">
                  <b>When</b> &lt;トリガー事象が発生した瞬間&gt;, the system shall &lt;アクション(True/False代入)&gt;
                </div>
                <div style="font-size: 0.76rem; color: var(--text-muted);">
                  例: 「UPスイッチが操作されたとき（When）、システムはモータ上昇をTrueに設定しなければならない（shall）」
                </div>
              </div>

              <div style="background: var(--bg-card); border-left: 4px solid var(--accent-red); border-top: 1px solid var(--border-book); border-right: 1px solid var(--border-book); border-bottom: 1px solid var(--border-book); padding: 12px 16px; border-radius: var(--radius-sm);">
                <div style="font-weight: bold; color: var(--accent-red); font-size: 0.88rem;">3. Unwanted Behavior (異常系・安全防護要求)</div>
                <div style="font-family: var(--font-mono); font-size: 0.84rem; margin: 4px 0; color: var(--text-main);">
                  <b>If</b> &lt;危険条件がTrueなら&gt;, <b>then</b> the system shall &lt;安全反転アクション&gt;
                </div>
                <div style="font-size: 0.76rem; color: var(--text-muted);">
                  例: 「挟み込みを検知した場合（If）、システムはモータを直ちに反転下降させなければならない（shall）」
                </div>
              </div>

              <div style="background: var(--bg-card); border-left: 4px solid var(--accent-green); border-top: 1px solid var(--border-book); border-right: 1px solid var(--border-book); border-bottom: 1px solid var(--border-book); padding: 12px 16px; border-radius: var(--radius-sm);">
                <div style="font-weight: bold; color: var(--accent-green); font-size: 0.88rem;">4. Ubiquitous (普遍安全要求 / 不変条件)</div>
                <div style="font-family: var(--font-mono); font-size: 0.84rem; margin: 4px 0; color: var(--text-main);">
                  <b>The system shall</b> &lt;常に破ってはならない安全不変条件&gt;
                </div>
                <div style="font-size: 0.76rem; color: var(--text-muted);">
                  例: 「システムはいかなる稼働状態においても、モータ上昇と下降を同時にTrueにしてはならない（shall）」
                </div>
              </div>
            </div>
          </div>

          <!-- 修了証バッジ -->
          <div class="question-card" style="text-align: center; padding: 40px 24px; border: 2px solid var(--border-book); background: var(--bg-card);">
            <div style="font-size: 3.5rem; margin-bottom: 12px;">🏆</div>
            <h2 style="color: var(--text-main); font-size: 1.4rem; margin-bottom: 8px;">
              全カリキュラム修了おめでとうございます！
            </h2>
            <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto 20px; font-size: 0.9rem; line-height: 1.7;">
              あなたはもう、仕様書を読んで「とりあえずif文を足す」エンジニアではありません。<br>
              要求をトリガーと変数の真偽値に解体し、頭の中に美しい有向グラフを描き、抜け漏れのない仕様を書くことができる設計者です。
            </p>
            <div>
              <button class="btn btn-primary" style="padding: 10px 24px; font-size: 0.95rem;" onclick="window.FormalEdu.Presentation.Views.Chapter5ConclusionView.finishAll()">
                🎓 修了を確定してTopポータルへ戻る
              </button>
            </div>
          </div>
        </div>
      `;

      window.FormalEdu.Presentation.Views.Chapter5ConclusionView.activeInstance = this;
    }

    static finishAll() {
      const self = window.FormalEdu.Presentation.Views.Chapter5ConclusionView.activeInstance;
      if (self) {
        self.progressUseCase.markChapterComplete('ch5');
        self.router.navigate('portal');
      }
    }
  }

  window.FormalEdu.Presentation.Views.Chapter5ConclusionView = Chapter5ConclusionView;
})();
