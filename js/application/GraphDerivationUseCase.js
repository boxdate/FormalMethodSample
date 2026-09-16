/**
 * ============================================================================
 * GraphDerivationUseCase.js - グラフ創発導出ユースケース (Application Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Application = window.FormalEdu.Application || {};

  class GraphDerivationUseCase {
    /**
     * 変数のブール値の組み合わせから、該当する状態ノードを導出する
     * @param {Object} boolValues - { motor_up: boolean, motor_down: boolean, is_auto: boolean, is_pinched: boolean, is_reversing: boolean }
     */
    deriveState(boolValues) {
      const { motor_up, motor_down, is_auto, is_pinched, is_reversing } = boolValues;

      // 1. 致命的エラー（不変条件違反）
      if (motor_up && motor_down) {
        return {
          nodeId: 'ERROR_SHORT_CIRCUIT',
          name: '⚠️ 重大エラー: モータ短絡 (Hブリッジ破損危険)',
          type: 'danger',
          explanation: 'motor_up と motor_down が同時に True です！これはHブリッジ回路がショートして発火・焼損する最悪のバグです。',
        };
      }

      if (is_pinched && motor_up) {
        return {
          nodeId: 'ERROR_PINCH_VIOLATION',
          name: '⚠️ 重大違反: 挟み込み中の上昇駆動',
          type: 'danger',
          explanation: '挟み込みセンサが検知中なのにモータが上昇しています！重大な人身事故につながる不変条件違反です。',
        };
      }

      // 2. 正常な状態ノードの同定
      if (is_reversing) {
        return {
          nodeId: 'PINCH_REVERSING',
          name: 'PINCH_REVERSING (挟み込み反転下降)',
          type: 'safe',
          explanation: '挟み込み回避のための安全反転モードです (motor_down=True, motor_up=False, reversing=True)。',
        };
      }

      if (!motor_up && !motor_down) {
        return {
          nodeId: 'STOPPED',
          name: 'STOPPED (停止)',
          type: 'normal',
          explanation: 'モータは両方とも通電していません。これが「停止状態」の真の正体です。',
        };
      }

      if (motor_up && !is_auto) {
        return {
          nodeId: 'MANUAL_UP',
          name: 'MANUAL_UP (手動上昇)',
          type: 'normal',
          explanation: 'motor_up=True かつ is_auto=False。ユーザーがボタンを押し続けている状態です。',
        };
      }

      if (motor_down && !is_auto) {
        return {
          nodeId: 'MANUAL_DOWN',
          name: 'MANUAL_DOWN (手動下降)',
          type: 'normal',
          explanation: 'motor_down=True かつ is_auto=False。ユーザーがボタンを押し続けている状態です。',
        };
      }

      if (motor_up && is_auto) {
        return {
          nodeId: 'AUTO_UP',
          name: 'AUTO_UP (自動上昇)',
          type: 'normal',
          explanation: 'motor_up=True かつ is_auto=True。ボタンを離しても端まで移動する状態です。',
        };
      }

      if (motor_down && is_auto) {
        return {
          nodeId: 'AUTO_DOWN',
          name: 'AUTO_DOWN (自動下降)',
          type: 'normal',
          explanation: 'motor_down=True かつ is_auto=True。ボタンを離しても端まで移動する状態です。',
        };
      }

      return {
        nodeId: 'UNKNOWN',
        name: '未定義の状態',
        type: 'warning',
        explanation: '定義されていない変数の組み合わせです。',
      };
    }
  }

  window.FormalEdu.Application.GraphDerivationUseCase = GraphDerivationUseCase;
})();
