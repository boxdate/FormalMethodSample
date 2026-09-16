/**
 * ============================================================================
 * DirectedGraph.js - 有向グラフ・状態遷移エンジン (Domain Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Domain = window.FormalEdu.Domain || {};

  class DirectedGraph {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.nodesMap = new Map();
      this.edges = [...config.edges];
      this.invariants = [...config.invariants];

      for (const node of config.nodes) {
        this.nodesMap.set(node.id, node);
      }

      this.currentNodeId = config.initialNodeId;
      if (!this.nodesMap.has(this.currentNodeId)) {
        throw new Error(`Initial node "${this.currentNodeId}" does not exist in graph nodes.`);
      }
      this.context = { ...config.initialContext };
    }

    getCurrentNode() {
      return this.nodesMap.get(this.currentNodeId);
    }

    getContext() {
      return { ...this.context };
    }

    getNodes() {
      return Array.from(this.nodesMap.values());
    }

    getEdges() {
      return [...this.edges];
    }

    getInvariants() {
      return [...this.invariants];
    }

    getOutgoingEdges(nodeId = this.currentNodeId) {
      return this.edges.filter(edge => edge.sourceNodeId === nodeId);
    }

    /**
     * イベントを断定的にディスパッチし、遷移を実行する (Tell, Don't Ask)
     */
    dispatch(event) {
      const previousNodeId = this.currentNodeId;
      const candidateEdges = this.getOutgoingEdges(previousNodeId);

      // 該当エッジを検索（イベント一致 ∧ ガード成立）
      const matchedEdge = candidateEdges.find(edge => edge.canTraverse(event, this.context));

      if (!matchedEdge) {
        const eventEdge = candidateEdges.find(edge => edge.triggerEvent === event);
        const reason = eventEdge
          ? `ガード条件未成立: ${eventEdge.guard.expressionText} (${eventEdge.guard.description})`
          : `現在の状態 [${previousNodeId}] からはイベント "${event}" の遷移がありません`;

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

      // エッジ通過: アクションをコンテキストに適用
      matchedEdge.traverse(this.context);
      this.currentNodeId = matchedEdge.targetNodeId;

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

    updateContextVariable(key, value) {
      this.context[key] = value;
      return this.checkInvariants();
    }

    checkInvariants() {
      const broken = [];
      for (const inv of this.invariants) {
        if (!inv.verify(this.context)) {
          broken.push(inv);
        }
      }
      return broken;
    }

    reset(initialNodeId, initialContext) {
      if (initialNodeId && this.nodesMap.has(initialNodeId)) {
        this.currentNodeId = initialNodeId;
      }
      if (initialContext) {
        this.context = { ...initialContext };
      }
    }
  }

  window.FormalEdu.Domain.DirectedGraph = DirectedGraph;
})();
