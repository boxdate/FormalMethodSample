/**
 * ============================================================================
 * PowerWindowDomain.js - パワーウィンドウ仕様のドメイン定義 (Domain Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Domain = window.FormalEdu.Domain || {};

  const {
    StateVariable,
    SimpleCondition,
    BooleanAssignment,
    CompositeAction,
    StateNode,
    DirectedEdge,
    SafetyInvariant,
    DirectedGraph,
  } = window.FormalEdu.Domain;

  class PowerWindowDomain {
    static createVariables() {
      return [
        new StateVariable({ id: 'motor_up', name: 'モータ上昇駆動', description: '窓を上げる方向にモータが通電中', defaultValue: false }),
        new StateVariable({ id: 'motor_down', name: 'モータ下降駆動', description: '窓を下げる方向にモータが通電中', defaultValue: false }),
        new StateVariable({ id: 'is_auto', name: 'AUTOモード', description: 'ボタンを離しても端まで自動移動中', defaultValue: false }),
        new StateVariable({ id: 'is_pinched', name: '挟み込み検知', description: '挟み込みセンサが反応中', defaultValue: false }),
        new StateVariable({ id: 'is_reversing', name: '挟み込み反転中', description: '安全のための反転タイマーが作動中', defaultValue: false }),
      ];
    }

    static createGraph() {
      // 状態ノード (有向グラフの頂点)
      const nodeStopped = new StateNode({
        id: 'STOPPED',
        name: '停止 (STOPPED)',
        description: 'モータ非通電。静止状態。',
        isInitial: true,
        metadata: { x: 300, y: 150 },
      });

      const nodeManualUp = new StateNode({
        id: 'MANUAL_UP',
        name: '手動上昇 (MANUAL_UP)',
        description: 'UP短押し中。手を離すと停止する。',
        metadata: { x: 120, y: 60 },
      });

      const nodeManualDown = new StateNode({
        id: 'MANUAL_DOWN',
        name: '手動下降 (MANUAL_DOWN)',
        description: 'DOWN短押し中。手を離すと停止する。',
        metadata: { x: 480, y: 60 },
      });

      const nodeAutoUp = new StateNode({
        id: 'AUTO_UP',
        name: '自動上昇 (AUTO_UP)',
        description: '全閉まで自律上昇する。',
        metadata: { x: 120, y: 260 },
      });

      const nodeAutoDown = new StateNode({
        id: 'AUTO_DOWN',
        name: '自動下降 (AUTO_DOWN)',
        description: '全開まで自律下降する。',
        metadata: { x: 480, y: 260 },
      });

      const nodePinchReversing = new StateNode({
        id: 'PINCH_REVERSING',
        name: '挟み込み反転下降 (PINCH_REVERSING)',
        description: '最優先安全動作。0.5秒間下降する。',
        metadata: { x: 300, y: 350 },
      });

      const nodes = [nodeStopped, nodeManualUp, nodeManualDown, nodeAutoUp, nodeAutoDown, nodePinchReversing];

      // ガード論理式 (矢印の門番)
      const guardNotTop = new SimpleCondition('pos < 100', '窓が全閉(100%)ではない', ctx => (ctx.positionPercent || 0) < 100);
      const guardNotBottom = new SimpleCondition('pos > 0', '窓が全開(0%)ではない', ctx => (ctx.positionPercent || 0) > 0);
      const guardTrue = new SimpleCondition('true', '無条件に許可', () => true);

      // アクション (変数のTrue/False代入)
      const actStop = new CompositeAction('停止アクション', [
        new BooleanAssignment('motor_up', false, 'motor_up := false'),
        new BooleanAssignment('motor_down', false, 'motor_down := false'),
        new BooleanAssignment('is_auto', false, 'is_auto := false'),
        new BooleanAssignment('is_reversing', false, 'is_reversing := false'),
      ]);

      const actManualUp = new CompositeAction('手動上昇開始', [
        new BooleanAssignment('motor_up', true, 'motor_up := true'),
        new BooleanAssignment('motor_down', false, 'motor_down := false'),
        new BooleanAssignment('is_auto', false, 'is_auto := false'),
      ]);

      const actManualDown = new CompositeAction('手動下降開始', [
        new BooleanAssignment('motor_up', false, 'motor_up := false'),
        new BooleanAssignment('motor_down', true, 'motor_down := true'),
        new BooleanAssignment('is_auto', false, 'is_auto := false'),
      ]);

      const actAutoUp = new CompositeAction('自動上昇開始', [
        new BooleanAssignment('motor_up', true, 'motor_up := true'),
        new BooleanAssignment('motor_down', false, 'motor_down := false'),
        new BooleanAssignment('is_auto', true, 'is_auto := true'),
      ]);

      const actAutoDown = new CompositeAction('自動下降開始', [
        new BooleanAssignment('motor_up', false, 'motor_up := false'),
        new BooleanAssignment('motor_down', true, 'motor_down := true'),
        new BooleanAssignment('is_auto', true, 'is_auto := true'),
      ]);

      const actPinchReverse = new CompositeAction('挟み込み反転駆動', [
        new BooleanAssignment('motor_up', false, 'motor_up := false (即時遮断)'),
        new BooleanAssignment('motor_down', true, 'motor_down := true (安全反転)'),
        new BooleanAssignment('is_auto', false, 'is_auto := false'),
        new BooleanAssignment('is_reversing', true, 'is_reversing := true'),
      ]);

      // 有向エッジ (矢印)
      const edges = [
        // 停止から開始
        new DirectedEdge({ id: 'e1', sourceNodeId: 'STOPPED', targetNodeId: 'MANUAL_UP', triggerEvent: 'SW_MANUAL_UP', guard: guardNotTop, action: actManualUp, label: 'UP短押し [未全閉]' }),
        new DirectedEdge({ id: 'e2', sourceNodeId: 'STOPPED', targetNodeId: 'MANUAL_DOWN', triggerEvent: 'SW_MANUAL_DOWN', guard: guardNotBottom, action: actManualDown, label: 'DOWN短押し [未全開]' }),
        new DirectedEdge({ id: 'e3', sourceNodeId: 'STOPPED', targetNodeId: 'AUTO_UP', triggerEvent: 'SW_AUTO_UP', guard: guardNotTop, action: actAutoUp, label: 'UP長押し [未全閉]' }),
        new DirectedEdge({ id: 'e4', sourceNodeId: 'STOPPED', targetNodeId: 'AUTO_DOWN', triggerEvent: 'SW_AUTO_DOWN', guard: guardNotBottom, action: actAutoDown, label: 'DOWN長押し [未全開]' }),

        // 手動から停止
        new DirectedEdge({ id: 'e5', sourceNodeId: 'MANUAL_UP', targetNodeId: 'STOPPED', triggerEvent: 'SW_RELEASED', guard: guardTrue, action: actStop, label: '離す' }),
        new DirectedEdge({ id: 'e6', sourceNodeId: 'MANUAL_DOWN', targetNodeId: 'STOPPED', triggerEvent: 'SW_RELEASED', guard: guardTrue, action: actStop, label: '離す' }),
        new DirectedEdge({ id: 'e7', sourceNodeId: 'MANUAL_UP', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_TOP', guard: guardTrue, action: actStop, label: '全閉到達' }),
        new DirectedEdge({ id: 'e8', sourceNodeId: 'MANUAL_DOWN', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_BOTTOM', guard: guardTrue, action: actStop, label: '全開到達' }),

        // 自動から停止
        new DirectedEdge({ id: 'e9', sourceNodeId: 'AUTO_UP', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_TOP', guard: guardTrue, action: actStop, label: '全閉到達' }),
        new DirectedEdge({ id: 'e10', sourceNodeId: 'AUTO_DOWN', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_BOTTOM', guard: guardTrue, action: actStop, label: '全開到達' }),
        new DirectedEdge({ id: 'e11', sourceNodeId: 'AUTO_UP', targetNodeId: 'STOPPED', triggerEvent: 'SW_MANUAL_DOWN', guard: guardTrue, action: actStop, label: '逆押し中止' }),
        new DirectedEdge({ id: 'e12', sourceNodeId: 'AUTO_DOWN', targetNodeId: 'STOPPED', triggerEvent: 'SW_MANUAL_UP', guard: guardTrue, action: actStop, label: '逆押し中止' }),

        // 挟み込み
        new DirectedEdge({ id: 'e13', sourceNodeId: 'MANUAL_UP', targetNodeId: 'PINCH_REVERSING', triggerEvent: 'PINCH_DETECTED', guard: guardTrue, action: actPinchReverse, label: '挟み込み検知！' }),
        new DirectedEdge({ id: 'e14', sourceNodeId: 'AUTO_UP', targetNodeId: 'PINCH_REVERSING', triggerEvent: 'PINCH_DETECTED', guard: guardTrue, action: actPinchReverse, label: '挟み込み検知！' }),

        // 反転完了
        new DirectedEdge({ id: 'e15', sourceNodeId: 'PINCH_REVERSING', targetNodeId: 'STOPPED', triggerEvent: 'TIMER_TIMEOUT', guard: guardTrue, action: actStop, label: '反転完了' }),
        new DirectedEdge({ id: 'e16', sourceNodeId: 'PINCH_REVERSING', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_BOTTOM', guard: guardTrue, action: actStop, label: '下限到達' }),
      ];

      // 安全不変条件 (ISO 26262)
      const invariants = [
        new SafetyInvariant({
          id: 'INV-01',
          name: 'モータ短絡防止（排他制御）',
          description: 'モータUPとDOWNが同時にTrueになってはならない',
          formula: new SimpleCondition('!(motor_up && motor_down)', 'モータ排他', ctx => !(ctx.motor_up && ctx.motor_down)),
        }),
        new SafetyInvariant({
          id: 'INV-02',
          name: '挟み込み時の上昇禁止（最重要安全要件）',
          description: '挟み込み検知中にモータUPがTrueになってはならない',
          formula: new SimpleCondition('!(is_pinched && motor_up)', '挟み込み時上昇禁止', ctx => !(ctx.is_pinched && ctx.motor_up)),
        }),
        new SafetyInvariant({
          id: 'INV-03',
          name: '全閉時の上昇禁止',
          description: '窓が全閉(100%)の時にモータUPがTrueになってはならない',
          formula: new SimpleCondition('!(pos >= 100 && motor_up)', '全閉時上昇禁止', ctx => !((ctx.positionPercent || 0) >= 100 && ctx.motor_up)),
        }),
        new SafetyInvariant({
          id: 'INV-04',
          name: '全開時の下降禁止',
          description: '窓が全開(0%)の時にモータDOWNがTrueになってはならない',
          formula: new SimpleCondition('!(pos <= 0 && motor_down)', '全開時下降禁止', ctx => !((ctx.positionPercent || 0) <= 0 && ctx.motor_down)),
        }),
      ];

      const initialContext = {
        motor_up: false,
        motor_down: false,
        is_auto: false,
        is_pinched: false,
        is_reversing: false,
        positionPercent: 100,
        pinchReversingTimerMs: 0,
      };

      return new DirectedGraph({
        id: 'power_window_graph',
        name: '車載パワーウィンドウ状態遷移グラフ',
        nodes,
        edges,
        invariants,
        initialNodeId: 'STOPPED',
        initialContext,
      });
    }
  }

  window.FormalEdu.Domain.PowerWindowDomain = PowerWindowDomain;
})();
