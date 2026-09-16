/**
 * ============================================================================
 * CurriculumData.ts - 教材カリキュラム定義データ (Infrastructure Layer)
 * ============================================================================
 */

export interface ChapterMeta {
  id: string;              // "ch1", "ch2", etc.
  number: number;
  badge: string;           // "Step 1", "基礎", etc.
  title: string;
  subtitle: string;
  durationMinutes: number;
  level: '入門' | '基礎' | '実践' | '発展';
  summary: string;
  learningPoints: string[];
}

export const CURRICULUM_CHAPTERS: ChapterMeta[] = [
  {
    id: 'ch1',
    number: 1,
    badge: 'Step 1: 仕様解体',
    title: '仕様をバラす「トリガー」と「アクション」',
    subtitle: '自然言語の文章から「きっかけ」と「動作」を正確に切り出す',
    durationMinutes: 10,
    level: '入門',
    summary: '仕様書を読んでいきなりコードや状態図を描くのは挫折の元。まずは文章を「もし〜なら（トリガー）」と「〜する（アクション）」に分ける感覚を身につけます。',
    learningPoints: [
      '前提条件（ガード）と発生事象（イベント）をひとまとめに「トリガー」として捉える',
      '文脈に惑わされず、システムが行う「アクション」を抽出する',
      '日常会話の曖昧な「〜のとき」をエンジニアの視点で分解する',
    ],
  },
  {
    id: 'ch2',
    number: 2,
    badge: 'Step 2: 真偽値化',
    title: 'アクションを「True / False」で捉える',
    subtitle: '「いきなり状態遷移を考えるな！」世界の命題の代入として定義する',
    durationMinutes: 15,
    level: '基礎',
    summary: '「手動上昇状態へ遷移する」と考えると状態爆発が起きます。アクションを「モータ上昇 := True」「停止 := False」というブール値の代入として考えるクセをつけます。',
    learningPoints: [
      '状態遷移ではなく、物理出力や命題の「True / False 代入」と考える',
      'Tell, Don\'t Ask の原則: 状態変数に断定的に値をセットする',
      '複雑な仕様も、実は「変数の真偽値の反転」の集まりに過ぎないことを体感する',
    ],
  },
  {
    id: 'ch3',
    number: 3,
    badge: 'Step 3: グラフ創発',
    title: '状態と有向グラフが「立ち上がる」瞬間',
    subtitle: 'True/Falseの組み合わせが「状態」になり、トリガーが「矢印」になるアハ体験',
    durationMinutes: 15,
    level: '実践',
    summary: '人間が決めた状態箱ではなく、変数の真偽値の組み合わせから「停止」「上昇中」などの状態ノードが自然と浮き彫りになり、有向グラフが自動的に立ち上がる様子を視覚化します。',
    learningPoints: [
      '状態（ノード）とは「True/Falseの特定の組み合わせ」に名付けたもの',
      'トリガー＋ガードが「有向エッジ（矢印の門番）」になる',
      '矢印がないところには絶対にワープできないというグラフの直感を叩き込む',
    ],
  },
  {
    id: 'ch4',
    number: 4,
    badge: 'Step 4: 実践シミュレータ',
    title: 'パワーウィンドウ統合シミュレータ',
    subtitle: '仕様 ↔ トリガー＆アクション ↔ 状態グラフ ↔ 実機アニメが完全同期',
    durationMinutes: 20,
    level: '実践',
    summary: '車載パワーウィンドウの要求仕様を網羅した動的シミュレータ。ボタン操作や挟み込みセンサに応じて、有向グラフの光の流れ・論理式の評価・物理ドアの動きがリアルタイムに連動します。',
    learningPoints: [
      'ノード発光とエッジ通過のリアルタイムアニメーション',
      '挟み込み検知による安全反転シーケンス（最重要安全要求）',
      '安全不変条件（モータ短絡防止・挟み込み時上昇禁止）の常時モニタリング',
    ],
  },
  {
    id: 'ch5',
    number: 5,
    badge: 'Step 5: 種明かし',
    title: '種明かし ―― これが「BDD」と「EARS記法」の正体だ',
    subtitle: 'あなたが身につけた思考法が、なぜ現場の要求・テスト設計の最強の武器になるのか',
    durationMinutes: 10,
    level: '発展',
    summary: '難しそうに見える「BDD (Given-When-Then)」や「EARS記法」は、これまで学んだ「前提ブール値 ＋ トリガー ＋ True/False代入」そのもの。アレルギーが綺麗サッパリ消える種明かしです。',
    learningPoints: [
      'BDDの Given(前提ブール値) / When(トリガー) / Then(アクション代入) の完全一致',
      'EARSの While(状態駆動) / When(事象駆動) / If(異常系) のスッキリした整理',
      '要求分析から状態モデリング、テストコードまでが一気通貫で繋がる自信の獲得',
    ],
  },
];
