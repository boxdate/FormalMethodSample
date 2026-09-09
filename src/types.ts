/**
 * ============================================================================
 * 車載パワーウィンドウ制御 - 型定義 (Power Window Types)
 * ============================================================================
 * 
 * 【若手向け解説】
 * 車載組み込み（C言語 / AUTOSAR / MISRA C）では、マジックナンバー（例: state = 1）を
 * 徹底的に排除し、状態やイベントを enum (列挙型) で厳格に定義します。
 * ここでは、C言語の enum / struct に直接マッピングできる TypeScript の型を定義します。
 */

/**
 * 1. 状態の定義 (States)
 * 有限オートマトン（State Machine）が取りうる状態の一覧。
 */
export enum WindowState {
  STOPPED         = 'STOPPED',          // 停止状態 (初期状態)
  MANUAL_UP       = 'MANUAL_UP',        // 手動上昇中 (スイッチを押し続けている間)
  MANUAL_DOWN     = 'MANUAL_DOWN',      // 手動下降中
  AUTO_UP         = 'AUTO_UP',          // 自動上昇中 (スイッチを離しても端まで移動)
  AUTO_DOWN       = 'AUTO_DOWN',        // 自動下降中
  PINCH_REVERSING = 'PINCH_REVERSING',  // 挟み込み検知による反転下降中 (安全機能)
}

/**
 * 2. 入力イベントの定義 (Events)
 * システムの外から飛び込んでくる事象（スイッチ操作、センサ検知、タイマなど）。
 */
export enum WindowEvent {
  NONE            = 'NONE',
  SW_MANUAL_UP    = 'SW_MANUAL_UP',     // UPスイッチ通常押し
  SW_MANUAL_DOWN  = 'SW_MANUAL_DOWN',   // DOWNスイッチ通常押し
  SW_AUTO_UP      = 'SW_AUTO_UP',       // UPスイッチ全開（長押し/深押し）
  SW_AUTO_DOWN    = 'SW_AUTO_DOWN',     // DOWNスイッチ全開（長押し/深押し）
  SW_RELEASED     = 'SW_RELEASED',      // スイッチから手を離した
  LIMIT_TOP       = 'LIMIT_TOP',        // 上限端リミット到達 (全閉)
  LIMIT_BOTTOM    = 'LIMIT_BOTTOM',     // 下限端リミット到達 (全開)
  PINCH_DETECTED  = 'PINCH_DETECTED',   // ★安全要件: 挟み込みセンサ検知
  TIMER_TIMEOUT   = 'TIMER_TIMEOUT',    // タイマー満了 (反転時間など)
}

/**
 * 3. モータ駆動指示 (Actuator Output)
 * マイコンがHブリッジ回路（モータドライバ）に出す物理信号。
 */
export enum MotorCommand {
  STOP = 'STOP',
  UP   = 'UP',
  DOWN = 'DOWN',
}

/**
 * 4. コンテキスト（オブジェクトの内部状態・変数）
 * C言語では struct PowerWindowContext { ... } に相当します。
 */
export interface PowerWindowContext {
  state: WindowState;              // 現在の状態 (State)
  motorCmd: MotorCommand;          // モータへの出力指示 (Output)
  positionPercent: number;         // 窓の位置: 0% (全開) 〜 100% (全閉)
  pinchReversingTimerMs: number;   // 反転動作タイマー [ms]
  isPinchSensorActive: boolean;    // 挟み込みセンサの物理入力状態
}

/**
 * 5. Event-B 構造体（イベント・ガード・アクション）
 * 
 * Event-B の基本思想:
 * 「EVENT が発生した時、GUARD(前提条件) を満たしていれば、ACTION(状態更新) を実行する」
 */
export interface EventBTransition {
  eventName: WindowEvent;
  sourceState: WindowState;
  targetState: WindowState;
  guardDescription: string;
  guard: (ctx: Readonly<PowerWindowContext>) => boolean;
  actionDescription: string;
  action: (ctx: PowerWindowContext) => void;
}

/**
 * 6. 不変条件 (Invariant Rule) - 機能安全 (ISO 26262) の核心
 * システムがいかなる時も絶対に満たさなければならない安全ルール。
 * 1つでも違反した場合、設計または実装に致命的な欠陥（バグ）があることを意味します。
 */
export interface SafetyInvariant {
  id: string;
  name: string;
  description: string;
  check: (ctx: Readonly<PowerWindowContext>) => boolean; // true = 安全(PASS), false = 違反(FAIL)
}
