/**
 * ============================================================================
 * ActionAssignment.js - アクション・代入 (Domain Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Domain = window.FormalEdu.Domain || {};

  class BooleanAssignment {
    constructor(targetVariableId, targetValue, description) {
      this.targetVariableId = targetVariableId;
      this.targetValue = Boolean(targetValue);
      this.description = description || `${targetVariableId} := ${this.targetValue}`;
    }

    apply(context) {
      context[this.targetVariableId] = this.targetValue;
    }
  }

  class NumericAssignment {
    constructor(targetVariableId, targetValue, description) {
      this.targetVariableId = targetVariableId;
      this.targetValue = Number(targetValue);
      this.description = description || `${targetVariableId} := ${this.targetValue}`;
    }

    apply(context) {
      context[this.targetVariableId] = this.targetValue;
    }
  }

  class CompositeAction {
    constructor(name, assignments = []) {
      this.name = name;
      this.assignments = assignments;
    }

    apply(context) {
      for (const a of this.assignments) {
        a.apply(context);
      }
    }

    get descriptions() {
      return this.assignments.map(a => a.description);
    }
  }

  window.FormalEdu.Domain.BooleanAssignment = BooleanAssignment;
  window.FormalEdu.Domain.NumericAssignment = NumericAssignment;
  window.FormalEdu.Domain.CompositeAction = CompositeAction;
})();
