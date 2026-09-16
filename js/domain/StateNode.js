/**
 * ============================================================================
 * StateNode.js - 状態ノード (Domain Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Domain = window.FormalEdu.Domain || {};

  class StateNode {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.description = config.description || '';
      this.isInitial = Boolean(config.isInitial);
      this.identifyingCondition = config.identifyingCondition || null;
      this.metadata = config.metadata || {};
    }

    matches(context) {
      if (!this.identifyingCondition) return true;
      return this.identifyingCondition.evaluate(context);
    }
  }

  window.FormalEdu.Domain.StateNode = StateNode;
})();
