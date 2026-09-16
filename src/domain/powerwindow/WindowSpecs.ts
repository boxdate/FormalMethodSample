/**
 * ============================================================================
 * WindowSpecs.ts - パワーウィンドウ仕様のドメイン定義
 * ============================================================================
 * 
 * 自然言語仕様 (REQ-001 〜 REQ-006) を、
 * 1. 命題（状態変数）
 * 2. ガード論理式
 * 3. アクション（True/False代入）
 * 4. 状態ノード
 * 5. 有向エッジ（遷移）
 * 6. 安全不変条件
 * に完全にマッピングして構築するファクトリ。
 */

import { StateVariable } from '../model/StateVariable';
import { SimpleCondition, LogicalAnd, LogicalNot, ILogicalFormula } from '../model/LogicalFormula';
import { BooleanAssignment, CompositeAction } from '../model/ActionAssignment';
import { StateNode } from '../model/StateNode';
import { DirectedEdge } from '../model/DirectedEdge';
import { SafetyInvariant } from '../model/SafetyInvariant';
import { DirectedGraph } from '../model/DirectedGraph';

export class WindowDomainFactory {
  /**
   * 1. 状態変数の定義（命題）
   */
  public static createVariables(): StateVariable[] {
    return [
      new StateVariable({ id: 'motor_up', name: 'モータ上昇駆動中', description: 'モータが窓を上げる方向に回転している', defaultValue: false }),
      new StateVariable({ id: 'motor_down', name: 'モータ下降駆動中', description: 'モータが窓を下げる方向に回転している', defaultValue: false }),
      new StateVariable({ id: 'is_auto', name: 'AUTOモード中', description: 'スイッチを離しても端まで自律移動する', defaultValue: false }),
      new StateVariable({ id: 'is_pinched', name: '挟み込み検知中', description: '挟み込みセンサが反応している', defaultValue: false }),
      new StateVariable({ id: 'is_reversing', name: '挟み込み反転中', description: '安全反転タイマーが作動している', defaultValue: false }),
    ];
  }

  /**
   * 2. パワーウィンドウの有向グラフモデル生成
   */
  public static createGraph(): DirectedGraph {
    // 状態ノード
    const nodeStopped = new StateNode({
      id: 'STOPPED',
      name: '停止 (STOPPED)',
      description: 'モータは非通電で窓は停止している',
      isInitial: true,
      metadata: { x: 260, y: 180 },
    });

    const nodeManualUp = new StateNode({
      id: 'MANUAL_UP',
      name: '手動上昇 (MANUAL_UP)',
      description: 'UPスイッチが押されている間だけ上昇する',
      metadata: { x: 100, y: 60 },
    });

    const nodeManualDown = new StateNode({
      id: 'MANUAL_DOWN',
      name: '手動下降 (MANUAL_DOWN)',
      description: 'DOWNスイッチが押されている間だけ下降する',
      metadata: { x: 420, y: 60 },
    });

    const nodeAutoUp = new StateNode({
      id: 'AUTO_UP',
      name: '自動上昇 (AUTO_UP)',
      description: '手を離しても全閉まで上昇を継続する',
      metadata: { x: 100, y: 300 },
    });

    const nodeAutoDown = new StateNode({
      id: 'AUTO_DOWN',
      name: '自動下降 (AUTO_DOWN)',
      description: '手を離しても全開まで下降を継続する',
      metadata: { x: 420, y: 300 },
    });

    const nodePinchReversing = new StateNode({
      id: 'PINCH_REVERSING',
      name: '挟み込み反転下降 (PINCH_REVERSING)',
      description: '挟み込み検知により一定時間反転下降する（安全機能）',
      metadata: { x: 260, y: 380 },
    });

    const nodes = [nodeStopped, nodeManualUp, nodeManualDown, nodeAutoUp, nodeAutoDown, nodePinchReversing];

    // ガード論理式
    const guardNotTop = new SimpleCondition('pos < 100', '窓が全閉(100%)ではない', ctx => (ctx.positionPercent as number) < 100);
    const guardNotBottom = new SimpleCondition('pos > 0', '窓が全開(0%)ではない', ctx => (ctx.positionPercent as number) > 0);
    const guardTrue = new SimpleCondition('true', '無条件', () => true);

    // アクション
    const actStop = new CompositeAction('モータ停止', [
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

    // 有向エッジ（遷移）
    const edges: DirectedEdge[] = [
      // 停止からの遷移
      new DirectedEdge({ id: 'e1', sourceNodeId: 'STOPPED', targetNodeId: 'MANUAL_UP', triggerEvent: 'SW_MANUAL_UP', guard: guardNotTop, action: actManualUp, label: 'UP短押し [未全閉]' }),
      new DirectedEdge({ id: 'e2', sourceNodeId: 'STOPPED', targetNodeId: 'MANUAL_DOWN', triggerEvent: 'SW_MANUAL_DOWN', guard: guardNotBottom, action: actManualDown, label: 'DOWN短押し [未全開]' }),
      new DirectedEdge({ id: 'e3', sourceNodeId: 'STOPPED', targetNodeId: 'AUTO_UP', triggerEvent: 'SW_AUTO_UP', guard: guardNotTop, action: actAutoUp, label: 'UP AUTO長押し [未全閉]' }),
      new DirectedEdge({ id: 'e4', sourceNodeId: 'STOPPED', targetNodeId: 'AUTO_DOWN', triggerEvent: 'SW_AUTO_DOWN', guard: guardNotBottom, action: actAutoDown, label: 'DOWN AUTO長押し [未全開]' }),

      // 手動動作からの停止
      new DirectedEdge({ id: 'e5', sourceNodeId: 'MANUAL_UP', targetNodeId: 'STOPPED', triggerEvent: 'SW_RELEASED', guard: guardTrue, action: actStop, label: '離す' }),
      new DirectedEdge({ id: 'e6', sourceNodeId: 'MANUAL_DOWN', targetNodeId: 'STOPPED', triggerEvent: 'SW_RELEASED', guard: guardTrue, action: actStop, label: '離す' }),
      new DirectedEdge({ id: 'e7', sourceNodeId: 'MANUAL_UP', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_TOP', guard: guardTrue, action: actStop, label: '全閉到達' }),
      new DirectedEdge({ id: 'e8', sourceNodeId: 'MANUAL_DOWN', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_BOTTOM', guard: guardTrue, action: actStop, label: '全開到達' }),

      // 自動動作からの停止
      new DirectedEdge({ id: 'e9', sourceNodeId: 'AUTO_UP', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_TOP', guard: guardTrue, action: actStop, label: '全閉到達' }),
      new DirectedEdge({ id: 'e10', sourceNodeId: 'AUTO_DOWN', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_BOTTOM', guard: guardTrue, action: actStop, label: '全開到達' }),
      new DirectedEdge({ id: 'e11', sourceNodeId: 'AUTO_UP', targetNodeId: 'STOPPED', triggerEvent: 'SW_MANUAL_DOWN', guard: guardTrue, action: actStop, label: '逆押しキャンセル' }),
      new DirectedEdge({ id: 'e12', sourceNodeId: 'AUTO_DOWN', targetNodeId: 'STOPPED', triggerEvent: 'SW_MANUAL_UP', guard: guardTrue, action: actStop, label: '逆押しキャンセル' }),

      // ★最重要安全遷移: 挟み込み
      new DirectedEdge({ id: 'e13', sourceNodeId: 'MANUAL_UP', targetNodeId: 'PINCH_REVERSING', triggerEvent: 'PINCH_DETECTED', guard: guardTrue, action: actPinchReverse, label: '挟み込み検知！' }),
      new DirectedEdge({ id: 'e14', sourceNodeId: 'AUTO_UP', targetNodeId: 'PINCH_REVERSING', triggerEvent: 'PINCH_DETECTED', guard: guardTrue, action: actPinchReverse, label: '挟み込み検知！' }),

      // 反転終了
      new DirectedEdge({ id: 'e15', sourceNodeId: 'PINCH_REVERSING', targetNodeId: 'STOPPED', triggerEvent: 'TIMER_TIMEOUT', guard: guardTrue, action: actStop, label: '0.5s反転完了' }),
      new DirectedEdge({ id: 'e16', sourceNodeId: 'PINCH_REVERSING', targetNodeId: 'STOPPED', triggerEvent: 'LIMIT_BOTTOM', guard: guardTrue, action: actStop, label: '下限到達' }),
    ];

    // 安全不変条件
    const invariants: SafetyInvariant[] = [
      new SafetyInvariant({
        id: 'INV-01',
        name: 'モータ短絡防止（排他制御）',
        description: 'モータUPとDOWNが同時にTrueになってはならない',
        formula: new SimpleCondition('!(motor_up && motor_down)', 'モータ排他', ctx => !(ctx.motor_up && ctx.motor_down)),
      }),
      new SafetyInvariant({
        id: 'INV-02',
        name: '挟み込み時の上昇禁止（最優先安全要件）',
        description: '挟み込み検知中にモータUPがTrueになってはならない',
        formula: new SimpleCondition('!(is_pinched && motor_up)', '挟み込み時上昇禁止', ctx => !(ctx.is_pinched && ctx.motor_up)),
      }),
      new SafetyInvariant({
        id: 'INV-03',
        name: '全閉時の上昇禁止',
        description: '窓が全閉(100%)の時にモータUPがTrueになってはならない',
        formula: new SimpleCondition('!(pos >= 100 && motor_up)', '全閉時上昇禁止', ctx => !((ctx.positionPercent as number) >= 100 && ctx.motor_up)),
      }),
      new SafetyInvariant({
        id: 'INV-04',
        name: '全開時の下降禁止',
        description: '窓が全開(0%)の時にモータDOWNがTrueになってはならない',
        formula: new SimpleCondition('!(pos <= 0 && motor_down)', '全開時下降禁止', ctx => !((ctx.positionPercent as number) <= 0 && ctx.motor_down)),
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
