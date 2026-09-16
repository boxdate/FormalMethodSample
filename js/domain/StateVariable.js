/**
 * ============================================================================
 * StateVariable.js - 命題・状態変数 (Domain Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Domain = window.FormalEdu.Domain || {};

  class StateVariable {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.description = config.description;
      this._value = Boolean(config.defaultValue);
    }

    get value() {
      return this._value;
    }

    set(newValue) {
      this._value = Boolean(newValue);
    }

    toggle() {
      this._value = !this._value;
    }

    clone() {
      return new StateVariable({
        id: this.id,
        name: this.name,
        description: this.description,
        defaultValue: this._value,
      });
    }
  }

  window.FormalEdu.Domain.StateVariable = StateVariable;
})();
