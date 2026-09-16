/**
 * ============================================================================
 * ActionAssignment.ts - アクション・代入 (Domain Model)
 * ============================================================================
 * 
 * 【教育的意図】
 * 「状態を遷移させる」と考える前に、
 * 「アクションとは、ある命題（状態変数）を True または False に書き換えることだ」
 * という思考のクセをつけます。
 * 
 * 例:
 *  - motor_up := true
 *  - motor_down := false
 *  - is_stopped := false
 */

export interface IActionAssignment {
  readonly targetVariableId: string;
  readonly targetValue: boolean | number | string;
  readonly description: string;
  apply(context: Record<string, any>): void;
}

export class BooleanAssignment implements IActionAssignment {
  constructor(
    public readonly targetVariableId: string,
    public readonly targetValue: boolean,
    public readonly description: string
  ) {}

  public apply(context: Record<string, any>): void {
    context[this.targetVariableId] = this.targetValue;
  }
}

export class NumericAssignment implements IActionAssignment {
  constructor(
    public readonly targetVariableId: string,
    public readonly targetValue: number,
    public readonly description: string
  ) {}

  public apply(context: Record<string, any>): void {
    context[this.targetVariableId] = this.targetValue;
  }
}

/**
 * 複合アクション（複数の変数代入をアトミックに実行）
 */
export class CompositeAction {
  constructor(
    public readonly name: string,
    public readonly assignments: IActionAssignment[]
  ) {}

  public apply(context: Record<string, any>): void {
    for (const assignment of this.assignments) {
      assignment.apply(context);
    }
  }

  public get descriptions(): string[] {
    return this.assignments.map(a => a.description);
  }
}
