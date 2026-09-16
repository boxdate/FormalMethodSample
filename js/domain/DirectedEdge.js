/**
 * ============================================================================
 * DirectedEdge.js - 有向エッジ・遷移 (Domain Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Domain = window.FormalEdu.Domain || {};

  class DirectedEdge {
    constructor(config) {
      this.id = config.id;
      this.sourceNodeId = config.sourceNodeId;
      this.targetNodeId = config.targetNodeId;
      this.triggerEvent = config.triggerEvent;
      this.guard = config.guard;
      this.action = config.action;
      this.label = config.label;
      this.description = config.description || config.label;
    }

    canTraverse(event, context) {
      if (this.triggerEvent !== event) {
        return false;
      }
      return this.guard.evaluate(context);
    }

    traverse(context) {
      this.action.apply(context);
    }
  }

  window.FormalEdu.Domain.DirectedEdge = DirectedEdge;
})();
