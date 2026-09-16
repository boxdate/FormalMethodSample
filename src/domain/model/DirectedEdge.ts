/**
 * ============================================================================
 * DirectedEdge.ts - 有向エッジ・遷移 (Domain Model)
 * ============================================================================
 * 
 * 【教育的意図】
 * 有向グラフの「矢印」そのもの。
 * 矢印を通るためには、「トリガー事象」が発生し、かつ「ガード（門番・論理式）」を
 * 突破しなければならないというルールをカプセル化します。
 * 
 * 矢印を通過した瞬間に、「アクション（状態変数のTrue/False代入）」が実行されます。
 */

import { ILogicalFormula, VariableMap } from './LogicalFormula';
import { CompositeAction } from './ActionAssignment';

export interface DirectedEdgeConfig {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  triggerEvent: string;          // トリガー事象名 (例: "SW_UP_PRESSED")
  guard: ILogicalFormula;        // ガード条件 (例: pos < 100 && !is_pinched)
  action: CompositeAction;       // 実行されるアクション (例: motor_up := true)
  label: string;                 // グラフ上のラベル
  description?: string;          // 解説
}

export class DirectedEdge {
  public readonly id: string;
  public readonly sourceNodeId: string;
  public readonly targetNodeId: string;
  public readonly triggerEvent: string;
  public readonly guard: ILogicalFormula;
  public readonly action: CompositeAction;
  public readonly label: string;
  public readonly description: string;

  constructor(config: DirectedEdgeConfig) {
    this.id = config.id;
    this.sourceNodeId = config.sourceNodeId;
    this.targetNodeId = config.targetNodeId;
    this.triggerEvent = config.triggerEvent;
    this.guard = config.guard;
    this.action = config.action;
    this.label = config.label;
    this.description = config.description || config.label;
  }

  /**
   * イベントおよび現在のコンテキストでこのエッジを通過可能かを判定
   */
  public canTraverse(event: string, context: VariableMap): boolean {
    if (this.triggerEvent !== event) {
      return false;
    }
    return this.guard.evaluate(context);
  }

  /**
   * エッジを通過し、アクションを変数コンテキストに適用する
   */
  public traverse(context: Record<string, any>): void {
    this.action.apply(context);
  }
}
