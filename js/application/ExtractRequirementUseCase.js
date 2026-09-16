/**
 * ============================================================================
 * ExtractRequirementUseCase.js - 要求抽出ユースケース (Application Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Application = window.FormalEdu.Application || {};

  class ExtractRequirementUseCase {
    /**
     * ユーザーのトークン分類回答を採点する
     * @param {Object} question - 設問データ (tokens: [{text, role}])
     * @param {Object} userSelections - ユーザーの選択マップ { tokenIndex: 'trigger' | 'action' | null }
     */
    evaluateQuestion(question, userSelections) {
      let correctCount = 0;
      const totalTokens = question.tokens.length;
      const details = [];

      for (let i = 0; i < totalTokens; i++) {
        const expected = question.tokens[i].role;
        const actual = userSelections[i] || null;
        const isMatch = (expected === actual);

        if (isMatch) {
          correctCount++;
        }

        details.push({
          index: i,
          text: question.tokens[i].text,
          expected,
          actual,
          isMatch,
        });
      }

      const isAllCorrect = (correctCount === totalTokens);

      return {
        isAllCorrect,
        correctCount,
        totalTokens,
        details,
      };
    }
  }

  window.FormalEdu.Application.ExtractRequirementUseCase = ExtractRequirementUseCase;
})();
