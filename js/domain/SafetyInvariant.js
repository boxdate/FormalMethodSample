/**
 * ============================================================================
 * SafetyInvariant.js - 安全不変条件 (Domain Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Domain = window.FormalEdu.Domain || {};

  class SafetyInvariant {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.description = config.description;
      this.formula = config.formula;
    }

    verify(context) {
      return Boolean(this.formula.evaluate(context));
    }
  }

  window.FormalEdu.Domain.SafetyInvariant = SafetyInvariant;
})();
