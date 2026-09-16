/**
 * ============================================================================
 * DirectedGraph.ts - 有向グラフ・状態遷移エンジン (Domain Model)
 * ============================================================================
 * 
 * 【教育的意図】
 * システム全体を有向グラフ（ノード＝状態、エッジ＝遷移）としてモデル化。
 * 
 * CLEAN原則:
 *  - 高凝集: グラフ構造の管理と遷移判定・実行に特化
 *  - 疎結合: UIやタイマーなどの外部環境には一切依存しない
 *  - カプセル化: 内部コンテキストの直接書き換えを防ぎ、dispatch() 経由でのみ更新
 *  - 断定的 (Tell, Don't Ask): 「dispatch(event)」と指示すれば、自ら遷移を実行し結果を返す
 *  - 非冗長: 重複した遷移定義を排除
 */

import { StateNode } from './StateNode';
import { DirectedEdge } from './DirectedEdge';
import { SafetyInvariant } from './SafetyInvariant';
import { VariableMap } from './LogicalFormula';

export interface TransitionResult {
  accepted: boolean;                     // 遷移が受理されたか
  previousNodeId: string;                // 遷移元ノード
  currentNodeId: string;                 // 現在（遷移後）ノード
  traversedEdge?: DirectedEdge;          // 通過したエッジ
  event: string;                         // 発生したイベント
  reason?: string;                       // 不受理の理由（ガード不成立など）
  brokenInvariants: SafetyInvariant[];   // 違反した不変条件（通常は空）
  contextSnapshot: VariableMap;          // 遷移後の全変数の値スナップショット
}

export interface DirectedGraphConfig {
  id: string;
  name: string;
  nodes: StateNode[];
  edges: DirectedEdge[];
  invariants: SafetyInvariant[];
  initialNodeId: string;
  initialContext: VariableMap;
}

export class DirectedGraph {
  public readonly id: string;
  public readonly name: string;
  private readonly nodesMap: Map<string, StateNode> = new Map();
  private readonly edges: DirectedEdge[] = [];
  private readonly invariants: SafetyInvariant[] = [];
  
  private currentNodeId: string;
  private context: Record<string, any>;

  constructor(config: DirectedGraphConfig) {
    this.id = config.id;
    this.name = config.name;
    for (const node of config.nodes) {
      this.nodesMap.set(node.id, node);
    }
    this.edges = [...config.edges];
    this.invariants = [...config.invariants];
    
    this.currentNodeId = config.initialNodeId;
    if (!this.nodesMap.has(this.currentNodeId)) {
      throw new Error(`Initial node "${this.currentNodeId}" does not exist in graph nodes.`);
    }
    this.context = { ...config.initialContext };
  }

  public getCurrentNode(): StateNode {
    return this.nodesMap.get(this.currentNodeId)!;
  }

  public getContext(): Readonly<VariableMap> {
    return { ...this.context };
  }

  public getNodes(): StateNode[] {
    return Array.from(this.nodesMap.values());
  }

  public getEdges(): DirectedEdge[] {
    return [...this.edges];
  }

  public getInvariants(): SafetyInvariant[] {
    return [...this.invariants];
  }

  /**
   * 現在ノードから出ているエッジの一覧を取得
   */
  public getOutgoingEdges(nodeId: string = this.currentNodeId): DirectedEdge[] {
    return this.edges.filter(edge => edge.sourceNodeId === nodeId);
  }

  /**
   * イベントを断定的にディスパッチし、遷移を実行する (Tell, Don't Ask)
   */
  public dispatch(event: string): TransitionResult {
    const previousNodeId = this.currentNodeId;
    const candidateEdges = this.getOutgoingEdges(previousNodeId);

    // 該当するエッジ（イベント一致 ∧ ガード成立）を検索
    const matchedEdge = candidateEdges.find(edge => edge.canTraverse(event, this.context));

    if (!matchedEdge) {
      // 受理されない場合（エッジがない、またはガードがFalse）
      const eventEdge = candidateEdges.find(edge => edge.triggerEvent === event);
      const reason = eventEdge
        ? `ガード条件未成立: ${eventEdge.guard.expressionText}`
        : `現在の状態 (${previousNodeId}) ではイベント "${event}" に対する遷移が定義されていません`;

      return {
        accepted: false,
        previousNodeId,
        currentNodeId: this.currentNodeId,
        event,
        reason,
        brokenInvariants: this.checkInvariants(),
        contextSnapshot: this.getContext(),
      };
    }

    // エッジを通過: アクションを変数コンテキストに適用
    matchedEdge.traverse(this.context);
    this.currentNodeId = matchedEdge.targetNodeId;

    // 不変条件チェック
    const broken = this.checkInvariants();

    return {
      accepted: true,
      previousNodeId,
      currentNodeId: this.currentNodeId,
      traversedEdge: matchedEdge,
      event,
      brokenInvariants: broken,
      contextSnapshot: this.getContext(),
    };
  }

  /**
   * 外部から環境変数（物理センサ値など）を直接更新し、不変条件を検証
   */
  public updateContextVariable(key: string, value: any): SafetyInvariant[] {
    this.context[key] = value;
    return this.checkInvariants();
  }

  public checkInvariants(): SafetyInvariant[] {
    const broken: SafetyInvariant[] = [];
    for (const inv of this.invariants) {
      if (!inv.verify(this.context)) {
        broken.push(inv);
      }
    }
    return broken;
  }

  public reset(initialNodeId?: string, initialContext?: VariableMap): void {
    if (initialNodeId && this.nodesMap.has(initialNodeId)) {
      this.currentNodeId = initialNodeId;
    }
    if (initialContext) {
      this.context = { ...initialContext };
    }
  }
}
