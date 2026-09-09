/**
 * ============================================================================
 * 車載パワーウィンドウ制御 - Event-B ステートマシン実装
 * ============================================================================
 * 
 * 【若手向け解説】
 * 本コードは、自然言語の仕様から導出した「Event-B (イベント・ガード・アクション)」を
 * そのまま素直に TypeScript のオブジェクトとして実装したものです。
 * 
 * 構造:
 *  1. 不変条件 (Invariants): 常時監視される安全ルール
 *  2. 状態遷移テーブル (Transitions): 各イベントに対する「ガード」と「アクション」
 *  3. ディスパッチャ (dispatch): イベント到来時にガードを評価し、アクションを実行
 */

import {
  WindowState,
  WindowEvent,
  MotorCommand,
  PowerWindowContext,
  EventBTransition,
  SafetyInvariant,
} from './types';

export interface DispatchResult {
  accepted: boolean;
  previousState: WindowState;
  currentState: WindowState;
  event: WindowEvent;
  guardDescription?: string;
  actionDescription?: string;
  reason?: string;
  brokenInvariants: SafetyInvariant[];
}

export class PowerWindowStateMachine {
  // コンテキスト（オブジェクト内部状態）
  private context: PowerWindowContext;

  // 不変条件（システムが常に満たすべき安全ルール）
  public readonly invariants: SafetyInvariant[] = [
    {
      id: 'INV-01',
      name: 'モータ排他制御',
      description: 'モータUPとモータDOWNが同時に指令されることは絶対にない',
      check: (ctx) => {
        // enum MotorCommand では排他的に定義されているため常に守られるが、
        // ハードウェアピン制御ではHブリッジ短絡（ショート焼損）防止の超重要ルール
        return ctx.motorCmd === MotorCommand.STOP ||
               ctx.motorCmd === MotorCommand.UP   ||
               ctx.motorCmd === MotorCommand.DOWN;
      },
    },
    {
      id: 'INV-02',
      name: '挟み込み時の上昇禁止（最重要安全要件）',
      description: '挟み込みセンサが反応している間、モータUPを指令してはならない',
      check: (ctx) => {
        if (ctx.isPinchSensorActive && ctx.motorCmd === MotorCommand.UP) {
          return false; // 違反！重大な人身事故リスク
        }
        return true;
      },
    },
    {
      id: 'INV-03',
      name: '全閉時の上昇禁止',
      description: '窓が全閉(100%)のとき、モータUPを指令してはならない',
      check: (ctx) => {
        if (ctx.positionPercent >= 100 && ctx.motorCmd === MotorCommand.UP) {
          return false; // 違反！モータ過負荷・ロック電流の危険
        }
        return true;
      },
    },
    {
      id: 'INV-04',
      name: '全開時の下降禁止',
      description: '窓が全開(0%)のとき、モータDOWNを指令してはならない',
      check: (ctx) => {
        if (ctx.positionPercent <= 0 && ctx.motorCmd === MotorCommand.DOWN) {
          return false; // 違反！
        }
        return true;
      },
    },
  ];

  // Event-B 状態遷移テーブル
  // 仕様書に書かれたルールが 1:1 でここに並びます
  public readonly transitions: EventBTransition[] = [
    // -------------------------------------------------------------
    // 停止状態 (STOPPED) からの遷移
    // -------------------------------------------------------------
    {
      eventName: WindowEvent.SW_MANUAL_UP,
      sourceState: WindowState.STOPPED,
      targetState: WindowState.MANUAL_UP,
      guardDescription: '窓がまだ全閉(100%)ではない',
      guard: (ctx) => ctx.positionPercent < 100,
      actionDescription: '状態を MANUAL_UP に更新し、モータUPを開始する',
      action: (ctx) => {
        ctx.state = WindowState.MANUAL_UP;
        ctx.motorCmd = MotorCommand.UP;
      },
    },
    {
      eventName: WindowEvent.SW_MANUAL_DOWN,
      sourceState: WindowState.STOPPED,
      targetState: WindowState.MANUAL_DOWN,
      guardDescription: '窓がまだ全開(0%)ではない',
      guard: (ctx) => ctx.positionPercent > 0,
      actionDescription: '状態を MANUAL_DOWN に更新し、モータDOWNを開始する',
      action: (ctx) => {
        ctx.state = WindowState.MANUAL_DOWN;
        ctx.motorCmd = MotorCommand.DOWN;
      },
    },
    {
      eventName: WindowEvent.SW_AUTO_UP,
      sourceState: WindowState.STOPPED,
      targetState: WindowState.AUTO_UP,
      guardDescription: '窓がまだ全閉(100%)ではない',
      guard: (ctx) => ctx.positionPercent < 100,
      actionDescription: '状態を AUTO_UP に更新し、モータUPを開始する',
      action: (ctx) => {
        ctx.state = WindowState.AUTO_UP;
        ctx.motorCmd = MotorCommand.UP;
      },
    },
    {
      eventName: WindowEvent.SW_AUTO_DOWN,
      sourceState: WindowState.STOPPED,
      targetState: WindowState.AUTO_DOWN,
      guardDescription: '窓がまだ全開(0%)ではない',
      guard: (ctx) => ctx.positionPercent > 0,
      actionDescription: '状態を AUTO_DOWN に更新し、モータDOWNを開始する',
      action: (ctx) => {
        ctx.state = WindowState.AUTO_DOWN;
        ctx.motorCmd = MotorCommand.DOWN;
      },
    },

    // -------------------------------------------------------------
    // 手動上昇 (MANUAL_UP) 中の遷移
    // -------------------------------------------------------------
    {
      eventName: WindowEvent.SW_RELEASED,
      sourceState: WindowState.MANUAL_UP,
      targetState: WindowState.STOPPED,
      guardDescription: 'なし (常時成立)',
      guard: () => true,
      actionDescription: '状態を STOPPED に戻し、モータを停止する',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
      },
    },
    {
      eventName: WindowEvent.LIMIT_TOP,
      sourceState: WindowState.MANUAL_UP,
      targetState: WindowState.STOPPED,
      guardDescription: 'なし',
      guard: () => true,
      actionDescription: '全閉に到達したためモータ停止',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
        ctx.positionPercent = 100;
      },
    },
    {
      eventName: WindowEvent.PINCH_DETECTED,
      sourceState: WindowState.MANUAL_UP,
      targetState: WindowState.PINCH_REVERSING,
      guardDescription: '★安全機能: 上昇中に挟み込みを検知',
      guard: () => true,
      actionDescription: '直ちに反転下降(DOWN)を開始し、500msタイマを設定する',
      action: (ctx) => {
        ctx.state = WindowState.PINCH_REVERSING;
        ctx.motorCmd = MotorCommand.DOWN;
        ctx.pinchReversingTimerMs = 500; // 0.5秒間反転
      },
    },

    // -------------------------------------------------------------
    // 自動上昇 (AUTO_UP) 中の遷移
    // -------------------------------------------------------------
    {
      eventName: WindowEvent.LIMIT_TOP,
      sourceState: WindowState.AUTO_UP,
      targetState: WindowState.STOPPED,
      guardDescription: 'なし',
      guard: () => true,
      actionDescription: '全閉到達により自動停止',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
        ctx.positionPercent = 100;
      },
    },
    {
      eventName: WindowEvent.PINCH_DETECTED,
      sourceState: WindowState.AUTO_UP,
      targetState: WindowState.PINCH_REVERSING,
      guardDescription: '★安全機能: 自動上昇中の挟み込み検知',
      guard: () => true,
      actionDescription: '直ちに反転下降(DOWN)を開始し、500msタイマを設定する',
      action: (ctx) => {
        ctx.state = WindowState.PINCH_REVERSING;
        ctx.motorCmd = MotorCommand.DOWN;
        ctx.pinchReversingTimerMs = 500;
      },
    },
    {
      eventName: WindowEvent.SW_MANUAL_DOWN,
      sourceState: WindowState.AUTO_UP,
      targetState: WindowState.STOPPED,
      guardDescription: '自動上昇中のキャンセル操作',
      guard: () => true,
      actionDescription: 'モータを直ちに停止',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
      },
    },

    // -------------------------------------------------------------
    // 手動下降 (MANUAL_DOWN) / 自動下降 (AUTO_DOWN) 中の遷移
    // -------------------------------------------------------------
    {
      eventName: WindowEvent.SW_RELEASED,
      sourceState: WindowState.MANUAL_DOWN,
      targetState: WindowState.STOPPED,
      guardDescription: 'なし',
      guard: () => true,
      actionDescription: 'スイッチが離されたため停止',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
      },
    },
    {
      eventName: WindowEvent.LIMIT_BOTTOM,
      sourceState: WindowState.MANUAL_DOWN,
      targetState: WindowState.STOPPED,
      guardDescription: 'なし',
      guard: () => true,
      actionDescription: '全開到達のため停止',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
        ctx.positionPercent = 0;
      },
    },
    {
      eventName: WindowEvent.LIMIT_BOTTOM,
      sourceState: WindowState.AUTO_DOWN,
      targetState: WindowState.STOPPED,
      guardDescription: 'なし',
      guard: () => true,
      actionDescription: '全開到達のため自動停止',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
        ctx.positionPercent = 0;
      },
    },
    {
      eventName: WindowEvent.SW_MANUAL_UP,
      sourceState: WindowState.AUTO_DOWN,
      targetState: WindowState.STOPPED,
      guardDescription: '自動下降中のキャンセル操作',
      guard: () => true,
      actionDescription: 'モータを直ちに停止',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
      },
    },

    // -------------------------------------------------------------
    // 反転動作 (PINCH_REVERSING) 中の遷移
    // -------------------------------------------------------------
    {
      eventName: WindowEvent.TIMER_TIMEOUT,
      sourceState: WindowState.PINCH_REVERSING,
      targetState: WindowState.STOPPED,
      guardDescription: '反転タイマーが0になった',
      guard: (ctx) => ctx.pinchReversingTimerMs <= 0,
      actionDescription: '反転完了。モータを停止して安全を確保する',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
        ctx.isPinchSensorActive = false; // 挟み込み解除
      },
    },
    {
      eventName: WindowEvent.LIMIT_BOTTOM,
      sourceState: WindowState.PINCH_REVERSING,
      targetState: WindowState.STOPPED,
      guardDescription: '反転中に下限端に達した',
      guard: () => true,
      actionDescription: '下限端のため停止',
      action: (ctx) => {
        ctx.state = WindowState.STOPPED;
        ctx.motorCmd = MotorCommand.STOP;
        ctx.positionPercent = 0;
        ctx.isPinchSensorActive = false;
      },
    },
  ];

  constructor(initialPositionPercent: number = 0) {
    this.context = {
      state: WindowState.STOPPED,
      motorCmd: MotorCommand.STOP,
      positionPercent: initialPositionPercent,
      pinchReversingTimerMs: 0,
      isPinchSensorActive: false,
    };
  }

  /**
   * 現在のコンテキスト（読み取り専用）を取得
   */
  public getContext(): Readonly<PowerWindowContext> {
    return { ...this.context };
  }

  /**
   * イベントのディスパッチ (Event-B 実行コア)
   */
  public dispatch(event: WindowEvent): DispatchResult {
    const prevState = this.context.state;

    // 1. 現在の状態とイベントに一致する遷移を検索
    const matchedTransition = this.transitions.find(
      (t) => t.sourceState === prevState && t.eventName === event
    );

    if (!matchedTransition) {
      // 該当する遷移がない（この状態でこのイベントは無視）
      return {
        accepted: false,
        previousState: prevState,
        currentState: prevState,
        event,
        reason: `状態 [${prevState}] ではイベント [${event}] は未定義（無視）です`,
        brokenInvariants: this.checkInvariants(),
      };
    }

    // 2. ガード (GUARD) の評価
    const guardPassed = matchedTransition.guard(this.context);
    if (!guardPassed) {
      return {
        accepted: false,
        previousState: prevState,
        currentState: prevState,
        event,
        guardDescription: matchedTransition.guardDescription,
        reason: `ガード条件を満たしませんでした: [${matchedTransition.guardDescription}]`,
        brokenInvariants: this.checkInvariants(),
      };
    }

    // 3. アクション (ACTION) の実行
    matchedTransition.action(this.context);

    // 4. 不変条件 (INVARIANTS) の常時検証
    const brokenInvariants = this.checkInvariants();

    return {
      accepted: true,
      previousState: prevState,
      currentState: this.context.state,
      event,
      guardDescription: matchedTransition.guardDescription,
      actionDescription: matchedTransition.actionDescription,
      brokenInvariants,
    };
  }

  /**
   * 周期タスク（車載の 10ms / 20ms タスクに相当）
   * 物理的な窓の位置移動やタイマの減算を模擬します。
   */
  public onTick(deltaMs: number): DispatchResult[] {
    const results: DispatchResult[] = [];

    // タイマー減算
    if (this.context.state === WindowState.PINCH_REVERSING) {
      this.context.pinchReversingTimerMs -= deltaMs;
      if (this.context.pinchReversingTimerMs <= 0) {
        this.context.pinchReversingTimerMs = 0;
        const res = this.dispatch(WindowEvent.TIMER_TIMEOUT);
        results.push(res);
      }
    }

    // モータ回転による位置更新
    const SPEED_PERCENT_PER_SEC = 25; // 4秒で全開/全閉
    const deltaPercent = (SPEED_PERCENT_PER_SEC * deltaMs) / 1000;

    if (this.context.motorCmd === MotorCommand.UP) {
      this.context.positionPercent += deltaPercent;
      if (this.context.positionPercent >= 100) {
        this.context.positionPercent = 100;
        const res = this.dispatch(WindowEvent.LIMIT_TOP);
        results.push(res);
      }
    } else if (this.context.motorCmd === MotorCommand.DOWN) {
      this.context.positionPercent -= deltaPercent;
      if (this.context.positionPercent <= 0) {
        this.context.positionPercent = 0;
        const res = this.dispatch(WindowEvent.LIMIT_BOTTOM);
        results.push(res);
      }
    }

    return results;
  }

  /**
   * 挟み込みセンサの物理入力を切り替える（テスト用）
   */
  public triggerPinchSensor(): DispatchResult {
    this.context.isPinchSensorActive = true;
    return this.dispatch(WindowEvent.PINCH_DETECTED);
  }

  /**
   * 全不変条件のチェック
   */
  public checkInvariants(): SafetyInvariant[] {
    const broken: SafetyInvariant[] = [];
    for (const inv of this.invariants) {
      if (!inv.check(this.context)) {
        broken.push(inv);
      }
    }
    return broken;
  }
}
