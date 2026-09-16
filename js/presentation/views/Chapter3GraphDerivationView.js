/**
 * ============================================================================
 * Chapter3GraphDerivationView.js - Step 3: グラフ創発体験 (Presentation Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Presentation = window.FormalEdu.Presentation || {};
  window.FormalEdu.Presentation.Views = window.FormalEdu.Presentation.Views || {};

  class Chapter3GraphDerivationView {
    constructor(containerEl, progressUseCase, derivationUseCase, router) {
      this.containerEl = containerEl;
      this.progressUseCase = progressUseCase;
      this.derivationUseCase = derivationUseCase;
      this.router = router;

      this.currentBools = {
        motor_up: false,
        motor_down: false,
        is_auto: false,
        is_pinched: false,
        is_reversing: false,
      };
    }

    render(chapterMeta) {
      this.chapterMeta = chapterMeta;

      this.containerEl.innerHTML = `
        <div class="workbook-container">
          <!-- ヘッダー -->
          <div class="workbook-header">
            <div class="workbook-header-top">
              <span class="badge badge-orange">${chapterMeta.badge}</span>
              <span style="font-size: 0.8rem; color: var(--text-dim);">想定時間: ${chapterMeta.durationMinutes}分</span>
            </div>
            <h1 class="workbook-title">${chapterMeta.title}</h1>
            <div class="workbook-subtitle">${chapterMeta.subtitle}</div>
            <div class="workbook-intro-box">
              💡 <b>若手向けアドバイス: 「状態は人間が作るのではなく、変数の組み合わせから立ち上がる」</b><br>
              左側のスイッチ（変数の真偽値）を自由に切り替えてみてください。<br>
              右側の有向グラフ上で、<b>変数の組み合わせに対応する状態ノードが自動的にハイライトされます。</b><br>
              「あらかじめ状態マシンがあるのではなく、論理の変化を外から見たものが『状態遷移図』なんだ！」という感覚を掴みましょう。
            </div>
          </div>

          <!-- メイングリッド -->
          <div class="graph-derivation-wrapper">
            <!-- 左パネル: 変数トグルスイッチ群 -->
            <div class="variable-control-panel">
              <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-main); border-bottom: 1px solid var(--border-book); padding-bottom: 8px;">
                ① 状態変数の真偽値 (True / False)
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-family: var(--font-mono); color: var(--accent-blue); font-weight: 600;">motor_up</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">モータ上昇通電</div>
                  </div>
                  <button class="toggle-btn" id="switch-motor_up" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.toggle('motor_up')">
                    FALSE
                  </button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-family: var(--font-mono); color: var(--accent-blue); font-weight: 600;">motor_down</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">モータ下降通電</div>
                  </div>
                  <button class="toggle-btn" id="switch-motor_down" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.toggle('motor_down')">
                    FALSE
                  </button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-family: var(--font-mono); color: var(--accent-blue); font-weight: 600;">is_auto</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">AUTOモード作動中</div>
                  </div>
                  <button class="toggle-btn" id="switch-is_auto" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.toggle('is_auto')">
                    FALSE
                  </button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-family: var(--font-mono); color: var(--accent-red); font-weight: 600;">is_pinched</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">挟み込みセンサ検知</div>
                  </div>
                  <button class="toggle-btn" id="switch-is_pinched" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.toggle('is_pinched')">
                    FALSE
                  </button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-family: var(--font-mono); color: var(--accent-gold); font-weight: 600;">is_reversing</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">安全反転タイマー作動</div>
                  </div>
                  <button class="toggle-btn" id="switch-is_reversing" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.toggle('is_reversing')">
                    FALSE
                  </button>
                </div>
              </div>

              <!-- プリセットボタン -->
              <div style="margin-top: 14px; border-top: 1px solid var(--border-book); padding-top: 12px;">
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">💡 代表的な組み合わせを試す:</div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button class="btn btn-secondary" style="font-size: 0.75rem; justify-content: flex-start;" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.applyPreset('stopped')">
                    停止 [up=F, down=F]
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.75rem; justify-content: flex-start;" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.applyPreset('manual_up')">
                    手動上昇 [up=T, auto=F]
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.75rem; justify-content: flex-start;" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.applyPreset('auto_up')">
                    自動上昇 [up=T, auto=T]
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.75rem; justify-content: flex-start; color: var(--accent-red);" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.applyPreset('pinch_danger')">
                    ⚠️ 危険: 挟み込み中の上昇 [up=T, pinch=T]
                  </button>
                  <button class="btn btn-secondary" style="font-size: 0.75rem; justify-content: flex-start; color: var(--accent-red);" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.applyPreset('short_circuit')">
                    ⚠️ 危険: モータ短絡 [up=T, down=T]
                  </button>
                </div>
              </div>
            </div>

            <!-- 右パネル: 動的有向グラフ描画エリア -->
            <div class="graph-canvas-panel">
              <div style="position: absolute; top: 16px; left: 20px; font-size: 0.85rem; font-weight: 600; color: var(--accent-blue);">
                ② 導出された有向グラフ上の状態 (State)
              </div>

              <!-- 状態判定バナー -->
              <div id="state-derivation-banner" style="width: 100%; margin-top: 24px; margin-bottom: 12px; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; line-height: 1.6;"></div>

              <!-- SVGグラフ -->
              <svg class="graph-svg-container" id="derivation-svg" viewBox="0 0 600 360">
                <!-- 矢印マーカー定義 -->
                <defs>
                  <marker id="arrow-ch3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#8c8275" />
                  </marker>
                  <marker id="arrow-ch3-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#24425f" />
                  </marker>
                </defs>

                <!-- エッジ (矢印線) -->
                <g id="svg-edges" stroke="#8c8275" stroke-width="1.5" marker-end="url(#arrow-ch3)">
                  <path d="M 300,140 L 160,80" />
                  <path d="M 300,140 L 440,80" />
                  <path d="M 300,180 L 160,240" />
                  <path d="M 300,180 L 440,240" />
                  <path d="M 160,95 L 300,300" stroke-dasharray="4,4" />
                  <path d="M 160,255 L 300,300" stroke-dasharray="4,4" />
                </g>

                <!-- 状態ノード (書籍図版風の円) -->
                <!-- STOPPED (停止) -->
                <g id="node-STOPPED" class="graph-node-group" transform="translate(300, 160)">
                  <circle r="44" fill="#ffffff" stroke="#c2b8a8" stroke-width="2" id="circle-STOPPED" />
                  <text text-anchor="middle" y="-6" fill="#2a2521" font-family="serif" font-size="12" font-weight="bold">STOPPED</text>
                  <text text-anchor="middle" y="12" fill="#73695f" font-family="monospace" font-size="9">up=F, dn=F</text>
                </g>

                <!-- MANUAL_UP (手動上昇) -->
                <g id="node-MANUAL_UP" class="graph-node-group" transform="translate(130, 70)">
                  <circle r="40" fill="#ffffff" stroke="#c2b8a8" stroke-width="2" id="circle-MANUAL_UP" />
                  <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="11" font-weight="bold">MANUAL_UP</text>
                  <text text-anchor="middle" y="12" fill="#73695f" font-family="monospace" font-size="9">up=T, auto=F</text>
                </g>

                <!-- MANUAL_DOWN (手動下降) -->
                <g id="node-MANUAL_DOWN" class="graph-node-group" transform="translate(470, 70)">
                  <circle r="40" fill="#ffffff" stroke="#c2b8a8" stroke-width="2" id="circle-MANUAL_DOWN" />
                  <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="11" font-weight="bold">MANUAL_DOWN</text>
                  <text text-anchor="middle" y="12" fill="#73695f" font-family="monospace" font-size="9">dn=T, auto=F</text>
                </g>

                <!-- AUTO_UP (自動上昇) -->
                <g id="node-AUTO_UP" class="graph-node-group" transform="translate(130, 250)">
                  <circle r="40" fill="#ffffff" stroke="#c2b8a8" stroke-width="2" id="circle-AUTO_UP" />
                  <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="11" font-weight="bold">AUTO_UP</text>
                  <text text-anchor="middle" y="12" fill="#73695f" font-family="monospace" font-size="9">up=T, auto=T</text>
                </g>

                <!-- AUTO_DOWN (自動下降) -->
                <g id="node-AUTO_DOWN" class="graph-node-group" transform="translate(470, 250)">
                  <circle r="40" fill="#ffffff" stroke="#c2b8a8" stroke-width="2" id="circle-AUTO_DOWN" />
                  <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="11" font-weight="bold">AUTO_DOWN</text>
                  <text text-anchor="middle" y="12" fill="#73695f" font-family="monospace" font-size="9">dn=T, auto=T</text>
                </g>

                <!-- PINCH_REVERSING (挟み込み反転) -->
                <g id="node-PINCH_REVERSING" class="graph-node-group" transform="translate(300, 310)">
                  <circle r="40" fill="#ffffff" stroke="#c2b8a8" stroke-width="2" id="circle-PINCH_REVERSING" />
                  <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="10" font-weight="bold">PINCH_REV</text>
                  <text text-anchor="middle" y="12" fill="#9e3623" font-family="monospace" font-size="8">reversing=T</text>
                </g>
              </svg>
            </div>
          </div>

          <!-- ボトムナビゲーション -->
          <div class="workbook-bottom-nav">
            <button class="btn btn-secondary" onclick="window.FormalEdu.App.router.navigate('ch2')">
              ◂ Step 2: 真偽値化へ戻る
            </button>
            <button class="btn btn-primary" onclick="window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.completeChapter()">
              ✓ 体験完了！ Step 4: 統合シミュレータへ進む ➔
            </button>
          </div>
        </div>
      `;

      window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.activeInstance = this;
      this.updateView();
    }

    static toggle(varKey) {
      const self = window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.activeInstance;
      if (!self) return;
      self.currentBools[varKey] = !self.currentBools[varKey];
      self.updateView();
    }

    static applyPreset(type) {
      const self = window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.activeInstance;
      if (!self) return;

      if (type === 'stopped') {
        self.currentBools = { motor_up: false, motor_down: false, is_auto: false, is_pinched: false, is_reversing: false };
      } else if (type === 'manual_up') {
        self.currentBools = { motor_up: true, motor_down: false, is_auto: false, is_pinched: false, is_reversing: false };
      } else if (type === 'auto_up') {
        self.currentBools = { motor_up: true, motor_down: false, is_auto: true, is_pinched: false, is_reversing: false };
      } else if (type === 'pinch_danger') {
        self.currentBools = { motor_up: true, motor_down: false, is_auto: false, is_pinched: true, is_reversing: false };
      } else if (type === 'short_circuit') {
        self.currentBools = { motor_up: true, motor_down: true, is_auto: false, is_pinched: false, is_reversing: false };
      }
      self.updateView();
    }

    updateView() {
      // 1. スイッチボタンの見た目更新
      for (const [key, val] of Object.entries(this.currentBools)) {
        const btn = document.getElementById(`switch-${key}`);
        if (btn) {
          btn.textContent = val ? 'TRUE' : 'FALSE';
          if (val) {
            btn.classList.add('active-true');
            btn.classList.remove('active-false');
          } else {
            btn.classList.remove('active-true');
            btn.classList.add('active-false');
          }
        }
      }

      // 2. ユースケースによる状態導出
      const derived = this.derivationUseCase.deriveState(this.currentBools);

      // 3. バナーの表示（書籍調の品格ある配色）
      const banner = document.getElementById('state-derivation-banner');
      if (banner) {
        if (derived.type === 'danger') {
          banner.style.background = '#faece8';
          banner.style.border = '1px solid var(--accent-red)';
          banner.style.color = 'var(--accent-red)';
          banner.innerHTML = `<b>${derived.name}</b><br>${derived.explanation}`;
        } else if (derived.type === 'safe') {
          banner.style.background = '#fcf4e6';
          banner.style.border = '1px solid var(--accent-gold)';
          banner.style.color = 'var(--accent-gold)';
          banner.innerHTML = `<b>現在ノード: ${derived.name}</b><br>${derived.explanation}`;
        } else {
          banner.style.background = '#eef4f8';
          banner.style.border = '1px solid var(--accent-blue)';
          banner.style.color = 'var(--accent-blue)';
          banner.innerHTML = `<b>現在ノード: ${derived.name}</b><br>${derived.explanation}`;
        }
      }

      // 4. SVGノードの強調切替（活版インク調の太枠と淡色塗り）
      const allNodeIds = ['STOPPED', 'MANUAL_UP', 'MANUAL_DOWN', 'AUTO_UP', 'AUTO_DOWN', 'PINCH_REVERSING'];
      for (const nid of allNodeIds) {
        const circle = document.getElementById(`circle-${nid}`);
        if (circle) {
          if (nid === derived.nodeId) {
            if (derived.type === 'danger') {
              circle.setAttribute('stroke', '#9e3623');
              circle.setAttribute('stroke-width', '3.5');
              circle.setAttribute('fill', '#faece8');
            } else if (derived.type === 'safe') {
              circle.setAttribute('stroke', '#94631e');
              circle.setAttribute('stroke-width', '3.5');
              circle.setAttribute('fill', '#fcf4e6');
            } else {
              circle.setAttribute('stroke', '#24425f');
              circle.setAttribute('stroke-width', '3.5');
              circle.setAttribute('fill', '#eef4f8');
            }
            circle.removeAttribute('filter');
          } else {
            circle.setAttribute('stroke', '#c2b8a8');
            circle.setAttribute('stroke-width', '1.5');
            circle.setAttribute('fill', '#ffffff');
            circle.removeAttribute('filter');
          }
        }
      }
    }

    static completeChapter() {
      const self = window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView.activeInstance;
      if (self) {
        self.progressUseCase.markChapterComplete('ch3');
        self.router.navigate('ch4');
      }
    }
  }

  window.FormalEdu.Presentation.Views.Chapter3GraphDerivationView = Chapter3GraphDerivationView;
})();
