/**
 * ============================================================================
 * LogicalFormula.js - ガード論理式 (Domain Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Domain = window.FormalEdu.Domain || {};

  class SimpleCondition {
    constructor(expressionText, description, predicate) {
      this.expressionText = expressionText;
      this.description = description;
      this.predicate = predicate;
    }

    evaluate(context) {
      return Boolean(this.predicate(context));
    }
  }

  class LogicalAnd {
    constructor(left, right) {
      this.left = left;
      this.right = right;
      this.expressionText = `(${left.expressionText} ∧ ${right.expressionText})`;
      this.description = `${left.description} かつ ${right.description}`;
    }

    evaluate(context) {
      return this.left.evaluate(context) && this.right.evaluate(context);
    }
  }

  class LogicalOr {
    constructor(left, right) {
      this.left = left;
      this.right = right;
      this.expressionText = `(${left.expressionText} ∨ ${right.expressionText})`;
      this.description = `${left.description} または ${right.description}`;
    }

    evaluate(context) {
      return this.left.evaluate(context) || this.right.evaluate(context);
    }
  }

  class LogicalNot {
    constructor(inner) {
      this.inner = inner;
      this.expressionText = `¬(${inner.expressionText})`;
      this.description = `NOT(${inner.description})`;
    }

    evaluate(context) {
      return !this.inner.evaluate(context);
    }
  }

  class LogicalImplication {
    constructor(antecedent, consequent) {
      this.antecedent = antecedent;
      this.consequent = consequent;
      this.expressionText = `(${antecedent.expressionText} ⇒ ${consequent.expressionText})`;
      this.description = `もし ${antecedent.description} ならば ${consequent.description}`;
    }

    evaluate(context) {
      const p = this.antecedent.evaluate(context);
      if (!p) {
        // 空虚な真 (Vacuous Truth)
        return true;
      }
      return this.consequent.evaluate(context);
    }
  }

  window.FormalEdu.Domain.SimpleCondition = SimpleCondition;
  window.FormalEdu.Domain.LogicalAnd = LogicalAnd;
  window.FormalEdu.Domain.LogicalOr = LogicalOr;
  window.FormalEdu.Domain.LogicalNot = LogicalNot;
  window.FormalEdu.Domain.LogicalImplication = LogicalImplication;
})();
