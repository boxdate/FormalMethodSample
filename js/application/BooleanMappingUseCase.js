/**
 * ============================================================================
 * BooleanMappingUseCase.js - ブール値代入ユースケース (Application Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Application = window.FormalEdu.Application || {};

  class BooleanMappingUseCase {
    /**
     * ユーザーが設定した各変数のTrue/Falseが期待値と合致しているか判定
     * @param {Object} question - 設問データ (variables: [{id, targetValue}])
     * @param {Object} userValues - ユーザー設定値 { varId: boolean }
     */
    evaluateQuestion(question, userValues) {
      let correctCount = 0;
      const totalVars = question.variables.length;
      const details = [];

      for (const v of question.variables) {
        const expected = v.targetValue;
        const actual = userValues[v.id];
        const isMatch = (expected === actual);

        if (isMatch) {
          correctCount++;
        }

        details.push({
          varId: v.id,
          name: v.name,
          expected,
          actual,
          isMatch,
          reason: v.reason,
        });
      }

      const isAllCorrect = (correctCount === totalVars);

      return {
        isAllCorrect,
        correctCount,
        totalVars,
        details,
      };
    }
  }

  window.FormalEdu.Application.BooleanMappingUseCase = BooleanMappingUseCase;
})();
