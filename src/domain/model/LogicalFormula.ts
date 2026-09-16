/**
 * ============================================================================
 * LogicalFormula.ts - ガード論理式 (Domain Model)
 * ============================================================================
 * 
 * 【教育的意図】
 * 有向グラフのエッジ（矢印）を通過できるかどうかの門番となる論理式。
 * 命題の真偽値や数値コンテキストを受け取り、ブール値を断定的に評価します。
 * 
 * 特に「含意 (P ⇒ Q)」は !P || Q として評価され、
 * 「前提が偽なら無条件に真（空虚な真）」という論理法則を体感させます。
 */

export type VariableMap = Record<string, boolean | number | string>;

export interface ILogicalFormula {
  readonly expressionText: string;  // 人間向けの文字列表現 (例: "is_stopped && !is_pinched")
  readonly description: string;     // 自然言語での解説
  evaluate(context: VariableMap): boolean;
}

export class SimpleCondition implements ILogicalFormula {
  constructor(
    public readonly expressionText: string,
    public readonly description: string,
    private readonly predicate: (ctx: VariableMap) => boolean
  ) {}

  public evaluate(context: VariableMap): boolean {
    return this.predicate(context);
  }
}

export class LogicalAnd implements ILogicalFormula {
  public readonly expressionText: string;
  public readonly description: string;

  constructor(private readonly left: ILogicalFormula, private readonly right: ILogicalFormula) {
    this.expressionText = `(${left.expressionText} ∧ ${right.expressionText})`;
    this.description = `${left.description} かつ ${right.description}`;
  }

  public evaluate(context: VariableMap): boolean {
    return this.left.evaluate(context) && this.right.evaluate(context);
  }
}

export class LogicalOr implements ILogicalFormula {
  public readonly expressionText: string;
  public readonly description: string;

  constructor(private readonly left: ILogicalFormula, private readonly right: ILogicalFormula) {
    this.expressionText = `(${left.expressionText} ∨ ${right.expressionText})`;
    this.description = `${left.description} または ${right.description}`;
  }

  public evaluate(context: VariableMap): boolean {
    return this.left.evaluate(context) || this.right.evaluate(context);
  }
}

export class LogicalNot implements ILogicalFormula {
  public readonly expressionText: string;
  public readonly description: string;

  constructor(private readonly inner: ILogicalFormula) {
    this.expressionText = `¬(${inner.expressionText})`;
    this.description = `NOT(${inner.description})`;
  }

  public evaluate(context: VariableMap): boolean {
    return !this.inner.evaluate(context);
  }
}

/**
 * 含意 (Implication: P ⇒ Q)
 * 論理等価式: ¬P ∨ Q
 */
export class LogicalImplication implements ILogicalFormula {
  public readonly expressionText: string;
  public readonly description: string;

  constructor(
    public readonly antecedent: ILogicalFormula, // 前提 P
    public readonly consequent: ILogicalFormula  // 結論 Q
  ) {
    this.expressionText = `(${antecedent.expressionText} ⇒ ${consequent.expressionText})`;
    this.description = `もし ${antecedent.description} ならば ${consequent.description}`;
  }

  public evaluate(context: VariableMap): boolean {
    const p = this.antecedent.evaluate(context);
    if (!p) {
      // 空虚な真 (Vacuous Truth)
      return true;
    }
    return this.consequent.evaluate(context);
  }
}
