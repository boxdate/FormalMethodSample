/**
 * ============================================================================
 * Chapter4SimulatorView.js - Step 4: パワーウィンドウ統合シミュレータ (Presentation Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Presentation = window.FormalEdu.Presentation || {};
  window.FormalEdu.Presentation.Views = window.FormalEdu.Presentation.Views || {};

  class Chapter4SimulatorView {
    constructor(containerEl, progressUseCase, router) {
      this.containerEl = containerEl;
      this.progressUseCase = progressUseCase;
      this.router = router;

      this.graph = null;
      this.timerInterval = null;
      this.logs = [];
    }

    render(chapterMeta) {
      this.chapterMeta = chapterMeta;

      // ドメイン層のパワーウィンドウグラフを生成
      this.graph = window.FormalEdu.Domain.PowerWindowDomain.createGraph();
      this.logs = [];

      this.containerEl.innerHTML = `
        <div class="simulator-container">
          <!-- ヘッダー -->
          <div class="workbook-header">
            <div class="workbook-header-top">
              <span class="badge badge-orange">${chapterMeta.badge}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">想定時間: ${chapterMeta.durationMinutes}分</span>
            </div>
            <h1 class="workbook-title">${chapterMeta.title}</h1>
            <div class="workbook-subtitle">${chapterMeta.subtitle}</div>
            <div class="workbook-intro-box">
              🚗 <b>実践ハンズオン:</b> ここまで学んだ「トリガー」「True/False代入」「有向グラフ」が完全同期して動く実機シミュレータです。<br>
              ボタンを押すと、<b>トリガー事象が発生 ➡ ガード条件判定 ➡ アクション実行 ➡ 有向グラフ上のノード移動 ➡ 物理窓の昇降</b> がすべて連動します。
            </div>
          </div>

          <!-- 3カラムシミュレータグリッド -->
          <div class="sim-grid">
            <!-- 左パネル: 物理ドアビュー ＆ 操作スイッチ -->
            <div class="sim-panel">
              <div class="sim-panel-title">
                <span>① 車載ドア ＆ 操作スイッチ</span>
                <span id="sim-state-badge" class="badge badge-blue">STOPPED</span>
              </div>

              <!-- 物理窓 -->
              <div class="car-door-wrapper">
                <div class="door-svg-container">
                  <div class="door-frame">
                    <div class="window-glass" id="sim-glass"></div>
                    <div class="pinch-obstacle" id="sim-obstacle">PINCH!</div>
                  </div>
                </div>

                <div class="sim-indicators">
                  <div class="sim-ind-card">
                    <div class="sim-ind-label">窓位置 (Position)</div>
                    <div class="sim-ind-val" id="sim-val-pos" style="color: var(--accent-blue);">100 %</div>
                  </div>
                  <div class="sim-ind-card">
                    <div class="sim-ind-label">モータ指令 (Output)</div>
                    <div class="sim-ind-val motor-stop" id="sim-val-motor">STOP</div>
                  </div>
                </div>
              </div>

              <!-- 操作スイッチ (実車HMI準拠: プル＝閉/上昇、プッシュ＝開/下降) -->
              <div class="ctrl-group-title">🎮 ユーザ操作スイッチ (実車HMI準拠):</div>
              <div class="ctrl-btn-grid">
                <button class="sim-ctrl-btn" onmousedown="window.FormalEdu.Presentation.Views.Chapter4SimulatorView.handleBtn('SW_MANUAL_UP')" onmouseup="window.FormalEdu.Presentation.Views.Chapter4SimulatorView.handleBtn('SW_RELEASED')">
                  ▲ プル(引く) 短押し<br><span style="font-size:0.7rem; color:var(--accent-blue); font-weight:600;">手動・閉</span>
                </button>
                <button class="sim-ctrl-btn" onmousedown="window.FormalEdu.Presentation.Views.Chapter4SimulatorView.handleBtn('SW_MANUAL_DOWN')" onmouseup="window.FormalEdu.Presentation.Views.Chapter4SimulatorView.handleBtn('SW_RELEASED')">
                  ▼ プッシュ(押す) 短押し<br><span style="font-size:0.7rem; color:var(--accent-gold); font-weight:600;">手動・開</span>
                </button>
                <button class="sim-ctrl-btn" onclick="window.FormalEdu.Presentation.Views.Chapter4SimulatorView.handleBtn('SW_AUTO_UP')">
                  ▲▲ プル(引く) 長押し<br><span style="font-size:0.7rem; color:var(--accent-blue); font-weight:600;">AUTO 全閉</span>
                </button>
                <button class="sim-ctrl-btn" onclick="window.FormalEdu.Presentation.Views.Chapter4SimulatorView.handleBtn('SW_AUTO_DOWN')">
                  ▼▼ プッシュ(押す) 長押し<br><span style="font-size:0.7rem; color:var(--accent-gold); font-weight:600;">AUTO 全開</span>
                </button>
              </div>

              <div class="ctrl-group-title" style="margin-top: 12px;">🚨 安全・異常系イベント:</div>
              <button class="sim-ctrl-btn danger" onclick="window.FormalEdu.Presentation.Views.Chapter4SimulatorView.handlePinch()">
                ⚡ 挟み込み（PINCH）を検知！
              </button>

              <button class="btn btn-secondary" style="font-size: 0.76rem; width: 100%; margin-top: 8px;" onclick="window.FormalEdu.Presentation.Views.Chapter4SimulatorView.resetSim()">
                ↻ シミュレータをリセット
              </button>
            </div>

            <!-- 中央パネル: 有向グラフ (Stateflow風) -->
            <div class="sim-panel" style="padding: 12px;">
              <div class="sim-panel-title">
                <span>② リアルタイム有向グラフ (State Machine)</span>
                <span style="font-size: 0.72rem; color: var(--text-muted);">現在ノードが発光</span>
              </div>

              <div class="stateflow-container">
                <svg id="sim-svg-graph" viewBox="0 0 600 460" style="width: 100%; height: 100%;">
                  <defs>
                    <marker id="sim-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 z" fill="#8c8275" />
                    </marker>
                    <marker id="sim-arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 z" fill="#24425f" />
                    </marker>
                  </defs>

                  <!-- エッジ線 -->
                  <g stroke="#8c8275" stroke-width="1.5" marker-end="url(#sim-arrow)">
                    <!-- STOPPED ↔ MANUAL_UP -->
                    <path d="M 300,160 L 160,80" />
                    <path d="M 160,95 L 280,180" stroke-dasharray="3,3" />

                    <!-- STOPPED ↔ MANUAL_DOWN -->
                    <path d="M 300,160 L 440,80" />
                    <path d="M 440,95 L 320,180" stroke-dasharray="3,3" />

                    <!-- STOPPED ↔ AUTO_UP -->
                    <path d="M 300,210 L 160,280" />
                    <path d="M 160,295 L 280,220" stroke-dasharray="3,3" />

                    <!-- STOPPED ↔ AUTO_DOWN -->
                    <path d="M 300,210 L 440,280" />
                    <path d="M 440,295 L 320,220" stroke-dasharray="3,3" />

                    <!-- 挟み込み反転エッジ -->
                    <path d="M 140,110 L 300,370" stroke="#9e3623" stroke-width="1.5" stroke-dasharray="4,4" />
                    <path d="M 140,310 L 300,370" stroke="#9e3623" stroke-width="1.5" stroke-dasharray="4,4" />
                    <path d="M 300,410 L 300,235" stroke="#94631e" stroke-width="1.5" />
                  </g>

                  <!-- 状態ノード群 (書籍図版風の円) -->
                  <!-- STOPPED -->
                  <g id="sim-node-STOPPED" transform="translate(300, 195)">
                    <circle r="44" fill="#eef4f8" stroke="#24425f" stroke-width="3" id="sim-c-STOPPED" />
                    <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="12" font-weight="bold">STOPPED</text>
                    <text text-anchor="middle" y="14" fill="#73695f" font-size="9">初期・停止</text>
                  </g>

                  <!-- MANUAL_UP -->
                  <g id="sim-node-MANUAL_UP" transform="translate(130, 70)">
                    <circle r="38" fill="#ffffff" stroke="#c2b8a8" stroke-width="1.5" id="sim-c-MANUAL_UP" />
                    <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="11" font-weight="bold">MAN_UP</text>
                    <text text-anchor="middle" y="14" fill="#24425f" font-size="9">上昇駆動</text>
                  </g>

                  <!-- MANUAL_DOWN -->
                  <g id="sim-node-MANUAL_DOWN" transform="translate(470, 70)">
                    <circle r="38" fill="#ffffff" stroke="#c2b8a8" stroke-width="1.5" id="sim-c-MANUAL_DOWN" />
                    <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="11" font-weight="bold">MAN_DN</text>
                    <text text-anchor="middle" y="14" fill="#94631e" font-size="9">下降駆動</text>
                  </g>

                  <!-- AUTO_UP -->
                  <g id="sim-node-AUTO_UP" transform="translate(130, 290)">
                    <circle r="38" fill="#ffffff" stroke="#c2b8a8" stroke-width="1.5" id="sim-c-AUTO_UP" />
                    <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="11" font-weight="bold">AUTO_UP</text>
                    <text text-anchor="middle" y="14" fill="#24425f" font-size="9">自動全閉へ</text>
                  </g>

                  <!-- AUTO_DOWN -->
                  <g id="sim-node-AUTO_DOWN" transform="translate(470, 290)">
                    <circle r="38" fill="#ffffff" stroke="#c2b8a8" stroke-width="1.5" id="sim-c-AUTO_DOWN" />
                    <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="11" font-weight="bold">AUTO_DN</text>
                    <text text-anchor="middle" y="14" fill="#94631e" font-size="9">自動全開へ</text>
                  </g>

                  <!-- PINCH_REVERSING -->
                  <g id="sim-node-PINCH_REVERSING" transform="translate(300, 390)">
                    <circle r="40" fill="#ffffff" stroke="#c2b8a8" stroke-width="1.5" id="sim-c-PINCH_REVERSING" />
                    <text text-anchor="middle" y="-4" fill="#2a2521" font-family="serif" font-size="10" font-weight="bold">PINCH_REV</text>
                    <text text-anchor="middle" y="14" fill="#9e3623" font-size="8">0.5秒安全反転</text>
                  </g>
                </svg>
              </div>
            </div>

            <!-- 右パネル: 安全不変条件 ＆ Event-Bログ -->
            <div class="sim-panel">
              <div class="sim-panel-title">
                <span>③ 安全不変条件 (ISO 26262)</span>
                <span class="badge badge-green">4項目 監視中</span>
              </div>

              <div class="invariants-list">
                ${this.graph.getInvariants().map(inv => `
                  <div class="inv-item pass" id="sim-inv-${inv.id}">
                    <div>
                      <div style="font-weight: 600; color: var(--text-main); font-size: 0.78rem;">${inv.id}: ${inv.name}</div>
                      <div style="font-size: 0.7rem; color: var(--text-muted);">${inv.description}</div>
                    </div>
                    <span class="badge badge-green" id="sim-inv-badge-${inv.id}">PASS</span>
                  </div>
                `).join('')}
              </div>

              <div class="sim-panel-title" style="margin-top: 10px;">
                <span>④ 遷移 ＆ ガード評価ログ</span>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Event-B</span>
              </div>

              <div class="sim-log-box" id="sim-log-container">
                <div class="log-entry"><span class="log-time">[INIT]</span> システム起動: STOPPED状態</div>
              </div>
            </div>
          </div>

          <!-- ボトムナビゲーション -->
          <div class="workbook-bottom-nav">
            <button class="btn btn-secondary" onclick="window.FormalEdu.App.router.navigate('ch3')">
              ◂ Step 3: グラフ創発へ戻る
            </button>
            <button class="btn btn-primary" onclick="window.FormalEdu.Presentation.Views.Chapter4SimulatorView.completeChapter()">
              ✓ 実践完了！ Step 5: BDD・EARSの種明かしへ進む ➔
            </button>
          </div>
        </div>
      `;

      window.FormalEdu.Presentation.Views.Chapter4SimulatorView.activeInstance = this;
      this.startSimulationLoop();
      this.updateView();
    }

    startSimulationLoop() {
      if (this.timerInterval) clearInterval(this.timerInterval);

      // 50ms周期の物理モータ＆タイマーループ
      this.timerInterval = setInterval(() => {
        if (!this.graph) return;

        const ctx = this.graph.getContext();
        let pos = ctx.positionPercent || 0;
        let changed = false;

        // モータ駆動による位置変化
        if (ctx.motor_up && pos < 100) {
          pos = Math.min(100, pos + 1);
          changed = true;
          this.graph.updateContextVariable('positionPercent', pos);
          if (pos >= 100) {
            this.handleEvent('LIMIT_TOP');
          }
        } else if (ctx.motor_down && pos > 0) {
          pos = Math.max(0, pos - 1);
          changed = true;
          this.graph.updateContextVariable('positionPercent', pos);
          if (pos <= 0) {
            this.handleEvent('LIMIT_BOTTOM');
          }
        }

        // 挟み込み反転タイマー処理
        if (ctx.is_reversing) {
          const t = (ctx.pinchReversingTimerMs || 0) + 50;
          this.graph.updateContextVariable('pinchReversingTimerMs', t);
          if (t >= 500) {
            this.graph.updateContextVariable('is_pinched', false);
            this.handleEvent('TIMER_TIMEOUT');
          }
        }

        if (changed || ctx.is_reversing) {
          this.updateView();
        }
      }, 50);
    }

    handleEvent(event) {
      const res = this.graph.dispatch(event);
      this.addLog(event, res);
      this.updateView();
    }

    static handleBtn(event) {
      const self = window.FormalEdu.Presentation.Views.Chapter4SimulatorView.activeInstance;
      if (self) self.handleEvent(event);
    }

    static handlePinch() {
      const self = window.FormalEdu.Presentation.Views.Chapter4SimulatorView.activeInstance;
      if (!self) return;

      const ctx = self.graph.getContext();
      if (ctx.motor_up) {
        self.graph.updateContextVariable('is_pinched', true);
        self.graph.updateContextVariable('pinchReversingTimerMs', 0);
        self.handleEvent('PINCH_DETECTED');
      } else {
        alert('ℹ️ 挟み込みセンサは「上昇中（MANUAL_UP または AUTO_UP）」にのみ作動します。まず上昇させてみてください。');
      }
    }

    static resetSim() {
      const self = window.FormalEdu.Presentation.Views.Chapter4SimulatorView.activeInstance;
      if (!self) return;
      self.graph = window.FormalEdu.Domain.PowerWindowDomain.createGraph();
      self.addLog('RESET', { accepted: true, currentNodeId: 'STOPPED' });
      self.updateView();
    }

    addLog(event, res) {
      const now = new Date();
      const timeStr = `${now.getMinutes()}:${String(now.getSeconds()).padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 100)}`;
      const logBox = document.getElementById('sim-log-container');
      if (!logBox) return;

      const entry = document.createElement('div');
      entry.className = 'log-entry';

      if (res.accepted) {
        entry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-event">${event}</span> ➔ <span class="log-trans">[${res.currentNodeId}]</span> (${res.traversedEdge ? res.traversedEdge.label : '遷移'})`;
      } else {
        entry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-event">${event}</span> ➔ <span style="color:var(--accent-red); font-weight:600;">REJECT</span> (<span class="log-guard">${res.reason || '未定義'}</span>)`;
      }

      logBox.appendChild(entry);
      logBox.scrollTop = logBox.scrollHeight;
    }

    updateView() {
      if (!this.graph) return;
      const ctx = this.graph.getContext();
      const currNode = this.graph.getCurrentNode();

      // 1. バッジ＆インジケーター
      const stateBadge = document.getElementById('sim-state-badge');
      if (stateBadge) stateBadge.textContent = currNode.id;

      const posVal = document.getElementById('sim-val-pos');
      if (posVal) posVal.textContent = `${ctx.positionPercent || 0} %`;

      const motorVal = document.getElementById('sim-val-motor');
      if (motorVal) {
        if (ctx.motor_up) {
          motorVal.textContent = 'UP (上昇)';
          motorVal.className = 'sim-ind-val motor-up';
        } else if (ctx.motor_down) {
          motorVal.textContent = 'DOWN (下降)';
          motorVal.className = 'sim-ind-val motor-down';
        } else {
          motorVal.textContent = 'STOP (停止)';
          motorVal.className = 'sim-ind-val motor-stop';
        }
      }

      // 2. 物理窓アニメーション
      // 0% (全開) = bottom: -100% (窓が下部に沈んで窓枠が開いている)
      // 100% (全閉) = bottom: 0% (窓ガラスが一番上までせり上がって閉まりきる)
      const glass = document.getElementById('sim-glass');
      if (glass) {
        const pos = ctx.positionPercent || 0;
        const bottomOffset = -(100 - pos);
        glass.style.bottom = `${bottomOffset}%`;
      }

      const obs = document.getElementById('sim-obstacle');
      if (obs) {
        obs.style.display = ctx.is_pinched ? 'flex' : 'none';
      }

      // 3. 有向グラフノードの強調切替（活版インク調の太枠と淡色塗り）
      const allNodeIds = ['STOPPED', 'MANUAL_UP', 'MANUAL_DOWN', 'AUTO_UP', 'AUTO_DOWN', 'PINCH_REVERSING'];
      for (const nid of allNodeIds) {
        const circle = document.getElementById(`sim-c-${nid}`);
        if (circle) {
          if (nid === currNode.id) {
            if (nid === 'PINCH_REVERSING') {
              circle.setAttribute('stroke', '#9e3623');
              circle.setAttribute('stroke-width', '3.5');
              circle.setAttribute('fill', '#faece8');
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

      // 4. 不変条件の評価
      const invariants = this.graph.getInvariants();
      for (const inv of invariants) {
        const ok = inv.verify(ctx);
        const invEl = document.getElementById(`sim-inv-${inv.id}`);
        const badgeEl = document.getElementById(`sim-inv-badge-${inv.id}`);
        if (invEl && badgeEl) {
          if (ok) {
            invEl.className = 'inv-item pass';
            badgeEl.className = 'badge badge-green';
            badgeEl.textContent = 'PASS';
          } else {
            invEl.className = 'inv-item fail';
            badgeEl.className = 'badge badge-red';
            badgeEl.textContent = 'FAIL';
          }
        }
      }
    }

    static completeChapter() {
      const self = window.FormalEdu.Presentation.Views.Chapter4SimulatorView.activeInstance;
      if (self) {
        if (self.timerInterval) clearInterval(self.timerInterval);
        self.progressUseCase.markChapterComplete('ch4');
        self.router.navigate('ch5');
      }
    }
  }

  window.FormalEdu.Presentation.Views.Chapter4SimulatorView = Chapter4SimulatorView;
})();
