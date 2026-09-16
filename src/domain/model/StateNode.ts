/**
 * ============================================================================
 * StateNode.ts - 状態ノード (Domain Model)
 * ============================================================================
 * 
 * 【教育的意図】
 * 「状態」は最初から存在する抽象的な箱ではなく、
 * 「状態変数の True/False の組み合わせ」に人間が名前をつけたものであることを示します。
 */

import { ILogicalFormula, VariableMap } from './LogicalFormula';

export interface StateNodeConfig {
  id: string;               // 状態識別子 (例: "STOPPED", "MANUAL_UP")
  name: string;             // 表示名 (例: "停止状態")
  description: string;      // 説明
  isInitial?: boolean;      // 初期状態かどうか
  identifyingCondition?: ILogicalFormula; // この状態であると見なす論理条件 (オプション)
  metadata?: Record<string, any>;         // UI描画用座標など (x, y)
}

export class StateNode {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly isInitial: boolean;
  public readonly identifyingCondition?: ILogicalFormula;
  public readonly metadata: Record<string, any>;

  constructor(config: StateNodeConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.isInitial = Boolean(config.isInitial);
    this.identifyingCondition = config.identifyingCondition;
    this.metadata = config.metadata || {};
  }

  /**
   * 現在の変数の真偽値コンテキストがこの状態ノードに合致しているかを判定
   */
  public matches(context: VariableMap): boolean {
    if (!this.identifyingCondition) {
      return true;
    }
    return this.identifyingCondition.evaluate(context);
  }
}
