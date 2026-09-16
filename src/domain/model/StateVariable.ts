/**
 * ============================================================================
 * StateVariable.ts - 命題・状態変数（Domain Model）
 * ============================================================================
 * 
 * 【教育的意図】
 * 初心者は「状態遷移」をいきなり抽象的な箱として考えがちですが、
 * 本質的には「ある命題（XXXである状態）が True または False であること」の集合です。
 * 
 * 本クラスは、システム内の1つの観測可能なブール命題（状態フラグ）を表現します。
 * 例:
 *  - "motor_up": モータが上昇駆動中である (boolean)
 *  - "is_stopped": システムが停止中である (boolean)
 *  - "is_pinched": 挟み込みを検知中である (boolean)
 */

export interface StateVariableConfig {
  id: string;              // 変数識別子 (例: "motor_up")
  name: string;            // 表示名 (例: "モータ上昇駆動")
  description: string;     // 自然言語での意味説明
  defaultValue: boolean;   // 初期真偽値
}

export class StateVariable {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  private _value: boolean;

  constructor(config: StateVariableConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this._value = config.defaultValue;
  }

  public get value(): boolean {
    return this._value;
  }

  /**
   * 変数の値を断定的に代入する (Tell, Don't Ask)
   */
  public set(newValue: boolean): void {
    this._value = Boolean(newValue);
  }

  public toggle(): void {
    this._value = !this._value;
  }

  public clone(): StateVariable {
    return new StateVariable({
      id: this.id,
      name: this.name,
      description: this.description,
      defaultValue: this._value,
    });
  }
}
