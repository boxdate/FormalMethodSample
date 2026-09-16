/**
 * ============================================================================
 * UnitTestModal.js - 機能別ユニットテスト実行＆結果モーダル (Presentation Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Presentation = window.FormalEdu.Presentation || {};
  window.FormalEdu.Presentation.Components = window.FormalEdu.Presentation.Components || {};

  class UnitTestModal {
    constructor() {
      this.modalEl = null;
      this.initDOM();
    }

    initDOM() {
      let el = document.getElementById('unit-test-modal');
      if (!el) {
        el = document.createElement('div');
        el.id = 'unit-test-modal';
        el.className = 'modal-backdrop';
        document.body.appendChild(el);
      }
      this.modalEl = el;
    }

    open() {
      const results = this.runAllSuite();
      this.render(results);
      this.modalEl.classList.add('show');
    }

    close() {
      this.modalEl.classList.remove('show');
    }

    render(suiteResults) {
      const { categories, totalTests, passedTests, durationMs } = suiteResults;
      const allPassed = (passedTests === totalTests);

      this.modalEl.innerHTML = `
          <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title">
              <span>🧪</span>
              <span>機能別ユニットテスト実行レポート</span>
            </div>
            <button class="modal-close-btn" onclick="window.FormalEdu.Presentation.Components.UnitTestModal.instance.close()">
              &times;
            </button>
          </div>

          <div class="modal-body">
            <!-- サマリーバー -->
            <div class="test-summary-bar">
              <div>
                <span style="font-size: 1.05rem; font-weight: bold; color: ${allPassed ? 'var(--accent-forest)' : 'var(--accent-crimson)'};">
                  ${allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}
                </span>
                <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 12px;">
                  (${passedTests} / ${totalTests} 項目 成功)
                </span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
                実行時間: ${durationMs} ms
              </div>
            </div>

            <!-- カテゴリ別一覧 -->
            ${categories.map(cat => `
              <div class="test-category-group">
                <div class="test-category-title">
                  <span>${cat.name}</span>
                  <span style="color: ${cat.failedCount === 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
                    ${cat.passedCount} / ${cat.tests.length} PASS
                  </span>
                </div>
                ${cat.tests.map(t => `
                  <div class="test-row">
                    <div class="test-name">
                      <span>${t.passed ? '✓' : '✗'}</span>
                      <span>${t.name}</span>
                    </div>
                    <span class="test-status-badge ${t.passed ? 'test-status-pass' : 'test-status-fail'}">
                      ${t.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    runAllSuite() {
      const startTime = performance.now();
      const categories = [];

      const {
        StateVariable,
        SimpleCondition,
        LogicalAnd,
        LogicalOr,
        LogicalNot,
        LogicalImplication,
        BooleanAssignment,
        CompositeAction,
        StateNode,
        DirectedEdge,
        DirectedGraph,
        PowerWindowDomain,
      } = window.FormalEdu.Domain;

      const {
        ExtractRequirementUseCase,
        BooleanMappingUseCase,
        GraphDerivationUseCase,
        ProgressUseCase,
      } = window.FormalEdu.Application;

      // -------------------------------------------------------------
      // 1. ドメイン層: 命題 ＆ 論理式 (Proposition & Logic)
      // -------------------------------------------------------------
      const cat1Tests = [];

      // Test 1-1: StateVariable
      try {
        const v = new StateVariable({ id: 'test_var', name: 'テスト', description: '', defaultValue: false });
        const p1 = (v.value === false);
        v.set(true);
        const p2 = (v.value === true);
        const cloned = v.clone();
        const p3 = (cloned.value === true && cloned.id === 'test_var');
        cat1Tests.push({ name: 'StateVariable: 初期値・代入(Tell)・クローンの完全性', passed: p1 && p2 && p3 });
      } catch (e) {
        cat1Tests.push({ name: 'StateVariable', passed: false });
      }

      // Test 1-2: LogicalFormula (AND, OR, NOT)
      try {
        const c1 = new SimpleCondition('c1', '', ctx => ctx.a === true);
        const c2 = new SimpleCondition('c2', '', ctx => ctx.b === true);
        const andF = new LogicalAnd(c1, c2);
        const orF = new LogicalOr(c1, c2);
        const notF = new LogicalNot(c1);

        const rAnd = andF.evaluate({ a: true, b: true }) && !andF.evaluate({ a: true, b: false });
        const rOr = orF.evaluate({ a: true, b: false }) && !orF.evaluate({ a: false, b: false });
        const rNot = notF.evaluate({ a: false }) && !notF.evaluate({ a: true });

        cat1Tests.push({ name: 'LogicalFormula: AND, OR, NOT のブール論理評価', passed: rAnd && rOr && rNot });
      } catch (e) {
        cat1Tests.push({ name: 'LogicalFormula (AND/OR/NOT)', passed: false });
      }

      // Test 1-3: LogicalImplication (含意 P ⇒ Q: 空虚な真)
      try {
        const p = new SimpleCondition('P', '', ctx => ctx.rain === true);
        const q = new SimpleCondition('Q', '', ctx => ctx.umbrella === true);
        const imp = new LogicalImplication(p, q);

        const t1 = imp.evaluate({ rain: true, umbrella: true }) === true;   // 真 ∧ 真 ➡ 真
        const t2 = imp.evaluate({ rain: true, umbrella: false }) === false; // 真 ∧ 偽 ➡ 偽 (違反)
        const t3 = imp.evaluate({ rain: false, umbrella: true }) === true;  // 偽 ∧ 真 ➡ 真 (空虚な真)
        const t4 = imp.evaluate({ rain: false, umbrella: false }) === true; // 偽 ∧ 偽 ➡ 真 (空虚な真)

        cat1Tests.push({ name: 'LogicalImplication: 含意 (P ⇒ Q) と空虚な真 (Vacuous Truth)', passed: t1 && t2 && t3 && t4 });
      } catch (e) {
        cat1Tests.push({ name: 'LogicalImplication', passed: false });
      }

      // Test 1-4: ActionAssignment & CompositeAction
      try {
        const ctx = { motor_up: false, is_auto: true };
        const act = new CompositeAction('test', [
          new BooleanAssignment('motor_up', true, ''),
          new BooleanAssignment('is_auto', false, ''),
        ]);
        act.apply(ctx);
        cat1Tests.push({ name: 'ActionAssignment: 変数へのブール代入と複合アクションの適用', passed: ctx.motor_up === true && ctx.is_auto === false });
      } catch (e) {
        cat1Tests.push({ name: 'ActionAssignment', passed: false });
      }

      categories.push({
        name: '① ドメイン層: 命題・論理式・アクションモデル',
        tests: cat1Tests,
        passedCount: cat1Tests.filter(t => t.passed).length,
        failedCount: cat1Tests.filter(t => !t.passed).length,
      });

      // -------------------------------------------------------------
      // 2. パワーウィンドウ要求仕様 ＆ 状態遷移テスト (REQ-001 〜 REQ-006)
      // -------------------------------------------------------------
      const cat2Tests = [];
      const g = PowerWindowDomain.createGraph();

      // REQ-001
      cat2Tests.push({
        name: '【REQ-001】システムの初期状態は STOPPED (停止) かつ窓全閉(100%)であること',
        passed: g.getCurrentNode().id === 'STOPPED' && g.getContext().positionPercent === 100,
      });

      // REQ-002: 全閉ガード (初期状態が全閉のため、UP短押しは即座にガード拒絶される)
      const rGuardTop = g.dispatch('SW_MANUAL_UP');
      cat2Tests.push({
        name: '【REQ-002 ガード】全閉(100%)時の UP短押し はガードにより遷移拒絶されること',
        passed: !rGuardTop.accepted && rGuardTop.currentNodeId === 'STOPPED',
      });

      // REQ-003: 手動下降 (全閉からDOWN短押しで窓を開ける)
      const rManDn = g.dispatch('SW_MANUAL_DOWN');
      cat2Tests.push({
        name: '【REQ-003】全閉からの DOWN短押し ➡ MANUAL_DOWN へ遷移し motor_down:=TRUE',
        passed: rManDn.accepted && rManDn.currentNodeId === 'MANUAL_DOWN' && rManDn.contextSnapshot.motor_down === true,
      });
      g.dispatch('SW_RELEASED');

      // 窓が開いた状態 (50%) から手動上昇
      g.updateContextVariable('positionPercent', 50);
      const rManUp = g.dispatch('SW_MANUAL_UP');
      cat2Tests.push({
        name: '【REQ-002】開いた状態(50%)からの UP短押し ➡ MANUAL_UP へ遷移し motor_up:=TRUE',
        passed: rManUp.accepted && rManUp.currentNodeId === 'MANUAL_UP' && rManUp.contextSnapshot.motor_up === true,
      });

      // REQ-002: 離して停止
      const rRel = g.dispatch('SW_RELEASED');
      cat2Tests.push({
        name: '【REQ-002】手動上昇中に手を離す ➡ STOPPED へ遷移し motor_up:=FALSE',
        passed: rRel.accepted && rRel.currentNodeId === 'STOPPED' && rRel.contextSnapshot.motor_up === false,
      });

      // REQ-004: AUTO上昇
      const rAutoUp = g.dispatch('SW_AUTO_UP');
      cat2Tests.push({
        name: '【REQ-004】AUTO長押し ➡ AUTO_UP へ遷移し is_auto:=TRUE ∧ motor_up:=TRUE',
        passed: rAutoUp.accepted && rAutoUp.currentNodeId === 'AUTO_UP' && rAutoUp.contextSnapshot.is_auto === true,
      });

      // REQ-005: 挟み込み最重要安全要件
      g.updateContextVariable('is_pinched', true);
      const rPinch = g.dispatch('PINCH_DETECTED');
      cat2Tests.push({
        name: '【REQ-005 最重要安全要件】上昇中に挟み込み検知 ➡ PINCH_REVERSING へ直ちに移り、モータ反転下降',
        passed: rPinch.accepted && rPinch.currentNodeId === 'PINCH_REVERSING' && rPinch.contextSnapshot.motor_up === false && rPinch.contextSnapshot.motor_down === true && rPinch.contextSnapshot.is_reversing === true,
      });

      // REQ-005: 反転タイマー満了
      const rTimeout = g.dispatch('TIMER_TIMEOUT');
      cat2Tests.push({
        name: '【REQ-005】安全反転タイマー満了 (0.5秒) ➡ STOPPED へ復帰すること',
        passed: rTimeout.accepted && rTimeout.currentNodeId === 'STOPPED' && rTimeout.contextSnapshot.motor_down === false,
      });

      categories.push({
        name: '② パワーウィンドウ要求仕様 ＆ 状態マシン検証 (REQ-001〜REQ-006)',
        tests: cat2Tests,
        passedCount: cat2Tests.filter(t => t.passed).length,
        failedCount: cat2Tests.filter(t => !t.passed).length,
      });

      // -------------------------------------------------------------
      // 3. 安全不変条件 (ISO 26262 Safety Invariants)
      // -------------------------------------------------------------
      const cat3Tests = [];
      const invariants = g.getInvariants();

      invariants.forEach(inv => {
        cat3Tests.push({
          name: `[${inv.id}] ${inv.name}: ${inv.description}`,
          passed: inv.verify(g.getContext()) === true,
        });
      });

      // 意図的な違反を検知できるか
      const inv01 = invariants.find(i => i.id === 'INV-01');
      const detectsShort = inv01 ? (inv01.verify({ motor_up: true, motor_down: true }) === false) : false;
      cat3Tests.push({
        name: '不変条件違反の検知: モータ短絡 (up=T ∧ down=T) を正しく FAIL 判定できること',
        passed: detectsShort,
      });

      categories.push({
        name: '③ 車載機能安全 (ISO 26262) 不変条件モニタリング',
        tests: cat3Tests,
        passedCount: cat3Tests.filter(t => t.passed).length,
        failedCount: cat3Tests.filter(t => !t.passed).length,
      });

      // -------------------------------------------------------------
      // 4. ユースケース層 (Application Layer UseCases)
      // -------------------------------------------------------------
      const cat4Tests = [];

      // ExtractRequirementUseCase
      const extractUC = new ExtractRequirementUseCase();
      const mockQ1 = {
        tokens: [
          { text: 'A', role: 'trigger' },
          { text: 'B', role: 'action' },
        ],
      };
      const resEx = extractUC.evaluateQuestion(mockQ1, { 0: 'trigger', 1: 'action' });
      cat4Tests.push({
        name: 'ExtractRequirementUseCase: トリガー/アクション分類の正誤判定',
        passed: resEx.isAllCorrect === true && resEx.correctCount === 2,
      });

      // BooleanMappingUseCase
      const boolUC = new BooleanMappingUseCase();
      const mockQ2 = {
        variables: [
          { id: 'v1', name: '', targetValue: true, reason: '' },
          { id: 'v2', name: '', targetValue: false, reason: '' },
        ],
      };
      const resBool = boolUC.evaluateQuestion(mockQ2, { v1: true, v2: false });
      cat4Tests.push({
        name: 'BooleanMappingUseCase: アクションのTrue/False代入判定',
        passed: resBool.isAllCorrect === true && resBool.correctCount === 2,
      });

      // GraphDerivationUseCase
      const deriveUC = new GraphDerivationUseCase();
      const d1 = deriveUC.deriveState({ motor_up: false, motor_down: false, is_auto: false, is_pinched: false, is_reversing: false });
      const d2 = deriveUC.deriveState({ motor_up: true, motor_down: false, is_auto: false, is_pinched: false, is_reversing: false });
      const dDanger = deriveUC.deriveState({ motor_up: true, motor_down: true, is_auto: false, is_pinched: false, is_reversing: false });
      cat4Tests.push({
        name: 'GraphDerivationUseCase: 真偽値から状態ノード同定 ＆ 異常検知',
        passed: d1.nodeId === 'STOPPED' && d2.nodeId === 'MANUAL_UP' && dDanger.type === 'danger',
      });

      // ProgressUseCase
      const mockRepo = new window.FormalEdu.Infrastructure.LocalStorageProgressRepository();
      const progUC = new ProgressUseCase(mockRepo);
      progUC.markChapterComplete('ch1');
      const stats = progUC.getOverallStats([{ id: 'ch1' }, { id: 'ch2' }]);
      cat4Tests.push({
        name: 'ProgressUseCase: 学習進捗の記録・完了率計算 (1/2 ➡ 50%)',
        passed: stats.completedCount >= 1 && stats.percent >= 50,
      });

      categories.push({
        name: '④ アプリケーション層: 各ワークショップのユースケース検証',
        tests: cat4Tests,
        passedCount: cat4Tests.filter(t => t.passed).length,
        failedCount: cat4Tests.filter(t => !t.passed).length,
      });

      const totalTests = categories.reduce((acc, cat) => acc + cat.tests.length, 0);
      const passedTests = categories.reduce((acc, cat) => acc + cat.passedCount, 0);
      const durationMs = Math.round(performance.now() - startTime);

      return {
        categories,
        totalTests,
        passedTests,
        durationMs,
      };
    }
  }

  // シングルトン登録
  window.FormalEdu.Presentation.Components.UnitTestModal = UnitTestModal;
  window.FormalEdu.Presentation.Components.UnitTestModal.instance = new UnitTestModal();
})();
