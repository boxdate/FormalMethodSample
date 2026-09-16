/**
 * ============================================================================
 * SafetyInvariant.ts - 安全不変条件 (Domain Model)
 * ============================================================================
 * 
 * 【教育的意図】
 * 「有向グラフ上のどのノードにいようと、絶対に破ってはならない安全の檻」。
 * 形式手法（Event-B）および車載機能安全（ISO 26262）の中核概念。
 */

import { ILogicalFormula, VariableMap } from './LogicalFormula';

export interface SafetyInvariantConfig {
  id: string;              // 例: "INV-01"
  name: string;            // 例: "モータ短絡防止"
  description: string;     // 例: "モータUPとDOWNが同時にTrueになってはならない"
  formula: ILogicalFormula;// 検証する論理式 (true = 安全, false = 違反)
}

export class SafetyInvariant {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly formula: ILogicalFormula;

  constructor(config: SafetyInvariantConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.formula = config.formula;
  }

  public verify(context: VariableMap): boolean {
    return this.formula.evaluate(context);
  }
}
