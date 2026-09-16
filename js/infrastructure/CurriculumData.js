/**
 * ============================================================================
 * CurriculumData.js - 教材カリキュラム定義データ (Infrastructure Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Infrastructure = window.FormalEdu.Infrastructure || {};

  const CURRICULUM_CHAPTERS = [
    {
      id: 'ch1',
      number: 1,
      badge: 'Step 1',
      title: '仕様を解体する「トリガー」と「アクション」',
      subtitle: '自然言語の文章から「契機（事象・条件）」と「作用（動作）」を過不足なく切り分ける',
      durationMinutes: 10,
      level: '入門',
      summary: '仕様書を読んでいきなり状態遷移図を描くのは挫折の元。まずは文章を「もし〜なら（トリガー）」と「〜する（アクション）」に分ける基本作法を学びます。',
      learningPoints: [
        '前提条件（ガード）と発生事象（イベント）をひとまとめに「トリガー」として捉える',
        '文脈に惑わされず、システムが行う「アクション」を抽出する',
        '日常会話の曖昧な「〜のとき」を設計者の視点で分解する',
      ],
      // ワークショップ設問
      questions: [
        {
          id: 'q1-1',
          specId: 'REQ-WIN-002',
          rawText: '停止中に「UPスイッチ短押し」された場合、窓が全閉でなければ「手動上昇」へ遷移し、モータを上昇駆動する。',
          tokens: [
            { text: '停止中に', role: 'trigger', label: '前提' },
            { text: '「UPスイッチ短押し」された場合', role: 'trigger', label: '事象' },
            { text: '窓が全閉でなければ', role: 'trigger', label: 'ガード' },
            { text: 'モータを上昇駆動する', role: 'action', label: 'アクション' },
          ],
          hint: '「停止中に」「押された場合」「全閉でなければ」はすべて動作を起こすための条件・トリガーです。',
        },
        {
          id: 'q1-2',
          specId: 'REQ-WIN-005',
          rawText: '上昇中に「挟み込み」を検知した場合、直ちにモータを0.5秒間反転下降駆動する。',
          tokens: [
            { text: '上昇中に', role: 'trigger', label: '前提' },
            { text: '「挟み込み」を検知した場合', role: 'trigger', label: '最重要事象' },
            { text: '直ちにモータを0.5秒間反転下降駆動する', role: 'action', label: '安全アクション' },
          ],
          hint: '「挟み込み検知」がトリガーとなり、直ちに「反転下降駆動」というアクションが起きます。',
        },
      ],
    },
    {
      id: 'ch2',
      number: 2,
      badge: 'Step 2',
      title: 'アクションを「真偽値（True / False）」で捉える',
      subtitle: '「いきなり状態遷移を考えるな」―― 世界の命題の代入として定義する',
      durationMinutes: 15,
      level: '基礎',
      summary: '「手動上昇状態へ遷移する」と考えると状態数が爆発します。アクションを「モータ上昇 := True」「停止 := False」というブール値の代入として捉える思考を身につけます。',
      learningPoints: [
        '状態遷移ではなく、物理出力や命題の「True / False 代入」と考える',
        'Tell, Don\'t Ask の原則: 状態変数に断定的に値をセットする',
        '複雑に見える仕様も、実は「変数の真偽値の反転」の集まりに過ぎないことを体感する',
      ],
      // ワークショップ設問
      questions: [
        {
          id: 'q2-1',
          actionText: 'モータを手動上昇駆動する',
          variables: [
            { id: 'motor_up', name: 'モータ上昇', targetValue: true, reason: '窓を上げるため通電' },
            { id: 'motor_down', name: 'モータ下降', targetValue: false, reason: '短絡防止のためOFF' },
            { id: 'is_auto', name: 'AUTOモード', targetValue: false, reason: '手動なのでOFF' },
          ],
        },
        {
          id: 'q2-2',
          actionText: '挟み込み検知時の安全反転下降',
          variables: [
            { id: 'motor_up', name: 'モータ上昇', targetValue: false, reason: '上昇を即時遮断！' },
            { id: 'motor_down', name: 'モータ下降', targetValue: true, reason: '救出のため下降駆動' },
            { id: 'is_reversing', name: '挟み込み反転中', targetValue: true, reason: '反転タイマー作動' },
          ],
        },
      ],
    },
    {
      id: 'ch3',
      number: 3,
      badge: 'Step 3',
      title: '状態と有向グラフが立ち上がる瞬間',
      subtitle: 'True/Falseの組み合わせが「状態」となり、トリガーが「矢印」を描く',
      durationMinutes: 15,
      level: '実践',
      summary: '人間があらかじめ状態マシンを作るのではなく、変数の真偽値の組み合わせから「停止」「上昇中」などの状態ノードが自然と浮き彫りになり、有向グラフが立ち上がる過程を体験します。',
      learningPoints: [
        '状態（ノード）とは「True/Falseの特定の組み合わせ」に名付けたもの',
        'トリガー＋ガードが「有向エッジ（矢印の門番）」になる',
        '矢印が存在しない経路には絶対に遷移できないというグラフの公理を実感する',
      ],
    },
    {
      id: 'ch4',
      number: 4,
      badge: 'Step 4',
      title: '車載パワーウィンドウ統合シミュレータ',
      subtitle: '仕様書 ↔ トリガー＆アクション ↔ 状態グラフ ↔ 実機アニメーションの完全同期',
      durationMinutes: 20,
      level: '実践',
      summary: '車載パワーウィンドウの要求仕様を網羅した動的シミュレータ。スイッチ操作や挟み込みセンサに応じて、有向グラフのノード遷移・論理式評価・物理ドアの動きが連動します。',
      learningPoints: [
        '現在ノードと通過エッジのリアルタイム遷移描画',
        '挟み込み検知による安全反転シーケンス（最重要安全要求）',
        '安全不変条件（モータ排他・挟み込み時上昇禁止）の常時モニタリング',
      ],
    },
    {
      id: 'ch5',
      number: 5,
      badge: 'Step 5',
      title: 'BDD・EARS記法の種明かし',
      subtitle: 'あなたが身につけた思考法が、なぜ現場の要求・テスト設計の最強の武器になるのか',
      durationMinutes: 10,
      level: '発展',
      summary: '難解に見える「BDD (Given-When-Then)」や「EARS記法」は、これまで学んだ「前提ブール値 ＋ トリガー ＋ True/False代入」そのもの。アレルギーが綺麗に消え去る種明かしです。',
      learningPoints: [
        'BDDの Given(前提ブール値) / When(トリガー) / Then(アクション代入) の完全一致',
        'EARSの While(状態駆動) / When(事象駆動) / If(異常系) の体系的整理',
        '要求分析から状態モデリング、テストコードまでが一気通貫で繋がる自信の獲得',
      ],
    },
  ];

  window.FormalEdu.Infrastructure.CURRICULUM_CHAPTERS = CURRICULUM_CHAPTERS;
})();
