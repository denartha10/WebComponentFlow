import * as vanX from 'vanjs-ext';
import { getCenterCoordinates } from './utilities';

/// <reference path="./types.js" />

export function createBoardStore() {
  /** @type{State} */
  const state = vanX.reactive({
    nodes: [],
    edges: [],
    ui: {
      scale: 1,
      offset: { x: 0, y: 0 },
      isCommandPressed: false,
      selectedNode: null,
      selectedEdge: null,
      draftEdge: null,
      dragging: {
        mode: null,
        nodeId: null,
        edgeId: null,
        isInInput: false,
        start: { x: 0, y: 0 },
        origOffset: { x: 0, y: 0 },
        origNodePos: { x: 0, y: 0 },
        origEdges: [],
      }
    }
  });

  function clampOffset() {
    const wrapper = document.getElementById('boardWrapper');
    const boardEl = document.getElementById('board');
    if (!wrapper || !boardEl) return;

    const wrapW = wrapper.clientWidth;
    const wrapH = wrapper.clientHeight;

    // boardEl.clientWidth/Height is the unscaled size
    const boardW = boardEl.clientWidth * state.ui.scale;
    const boardH = boardEl.clientHeight * state.ui.scale;

    // We want 0 ≥ offset.x ≥ wrapW - boardW
    const minX = Math.min(0, wrapW - boardW);
    const maxX = 0;
    state.ui.offset.x = Math.max(minX, Math.min(maxX, state.ui.offset.x));

    // And similarly for Y
    const minY = Math.min(0, wrapH - boardH);
    const maxY = 0;
    state.ui.offset.y = Math.max(minY, Math.min(maxY, state.ui.offset.y));
  }


  function setCommandModifier(isPressed) {
    state.ui.isCommandPressed = isPressed;
  }

  function selectNode(nodeId) {
    state.ui.selectedEdge = null;
    state.ui.selectedNode = nodeId;
  }

  function selectEdge(edgeId) {
    state.ui.selectedNode = null;
    state.ui.selectedEdge = edgeId;
  }

  function addNode(numberInputs, numberOutputs) {
    const wrapper = document.getElementById('boardWrapper');
    const rect = wrapper.getBoundingClientRect();

    // 1) Compute board-space bounds of visible area:
    const xMin = (rect.left - state.ui.offset.x) / state.ui.scale;
    const yMin = (rect.top - state.ui.offset.y) / state.ui.scale;
    const xMax = ((rect.left + wrapper.clientWidth) - state.ui.offset.x) / state.ui.scale;
    const yMax = ((rect.top + wrapper.clientHeight) - state.ui.offset.y) / state.ui.scale;

    // 2) Pick a random point inside those board-space bounds:
    const x = Math.random() * (xMax - xMin) + xMin;
    const y = Math.random() * (yMax - yMin) + yMin;

    // 3) Create the node at that board-space point:
    state.nodes.push({
      id: `node_${Math.random().toString(36).slice(2, 8)}`,
      numberInputs,
      numberOutputs,
      position: { x, y }
    });
  }

  function removeNode(nodeId = state.ui.selectedNode) {
    if (!nodeId) return;
    state.edges = state.edges.filter(e => e.nodeEndId !== nodeId && e.nodeStartId !== nodeId);
    state.nodes = state.nodes.filter(n => n.id !== nodeId);
    selectNode(null);
  }

  function addEdge(draft) {
    state.edges.push({ ...draft });
  }

  function removeEdge(edgeId = state.ui.selectedEdge) {
    if (!edgeId) return;
    state.edges = state.edges.filter(e => e.id !== edgeId);
    selectEdge(null);
  }

  function startBoardDrag({ x, y }) {
    state.ui.selectedNode = null;
    state.ui.selectedEdge = null;
    state.ui.dragging = {
      mode: 'board',
      start: { x, y },
      origOffset: {
        ...state.ui.offset
      }
    };
  }

  function startNodeDrag(nodeId, { x, y }) {
    selectNode(nodeId);
    const node = state.nodes.find(n => n.id === nodeId);
    state.ui.dragging = {
      mode: 'node',
      nodeId,
      start: { x, y },
      origOffset: { ...state.ui.offset },
      origNodePos: { ...node.position },
      origEdges: state.edges
        .filter(e => e.nodeStartId === nodeId || e.nodeEndId === nodeId)
        .map(e => ({ ref: e, origStart: { ...e.startPosition }, origEnd: { ...e.endPosition } }))
    };
  }

  function startEdgeCreation(nodeId, outputId, { x, y }) {
    selectEdge(null);
    selectNode(null);
    const sx = (x - state.ui.offset.x) / state.ui.scale;
    const sy = (y - state.ui.offset.y) / state.ui.scale;
    state.ui.draftEdge = {
      id: '',
      nodeStartId: nodeId,
      outputId,
      nodeEndId: '',
      inputId: '',
      startPosition: { x: sx, y: sy },
      endPosition: { x: sx, y: sy }
    };
    state.ui.dragging.mode = 'edge';
  }

  function updateDrag({ x, y }) {
    const d = state.ui.dragging;
    if (!d.mode) return;

    if (d.mode === 'node') {
      const dx = (x - d.start.x) / state.ui.scale;
      const dy = (y - d.start.y) / state.ui.scale;
      const node = state.nodes.find(n => n.id === d.nodeId);
      node.position = { x: d.origNodePos.x + dx, y: d.origNodePos.y + dy };
      d.origEdges.forEach(edgeSnap => {
        if (edgeSnap.ref.nodeStartId === d.nodeId) {
          edgeSnap.ref.startPosition = { x: edgeSnap.origStart.x + dx, y: edgeSnap.origStart.y + dy };
        }
        if (edgeSnap.ref.nodeEndId === d.nodeId) {
          edgeSnap.ref.endPosition = { x: edgeSnap.origEnd.x + dx, y: edgeSnap.origEnd.y + dy };
        }
      });
    }

    else if (d.mode === 'board') {

      const dx = x - d.start.x;
      const dy = y - d.start.y;

      state.ui.offset.x = d.origOffset.x + dx
      state.ui.offset.y = d.origOffset.y + dy

      clampOffset()
    }

    else if (d.mode === 'edge' && state.ui.draftEdge) {
      state.ui.draftEdge.endPosition = {
        x: (x - state.ui.offset.x) / state.ui.scale,
        y: (y - state.ui.offset.y) / state.ui.scale
      };
    }
  }

  function endDrag() {
    const d = state.ui.dragging;

    if (d.mode === 'edge' && d.isInInput && state.ui.draftEdge) {
      const draft = state.ui.draftEdge;
      const { centerX, centerY } = getCenterCoordinates(document.getElementById(draft.inputId));

      addEdge({
        ...draft,
        id: `edge_${draft.nodeStartId}_${draft.outputId}_${draft.nodeEndId}_${draft.inputId}`,
        endPosition: {
          x: (centerX - state.ui.offset.x) / state.ui.scale,
          y: (centerY - state.ui.offset.y) / state.ui.scale
        }
      });
    }

    state.ui.dragging = {
      mode: null,
      nodeId: null,
      edgeId: null,
      isInInput: false,
      start: { x: 0, y: 0 },
      origOffset: {
        x: 0,
        y: 0
      },
      origNodePos: {
        x: 0,
        y: 0
      },
      origEdges: []
    };

    state.ui.draftEdge = null;
  }

  function zoomBy(delta, event) {
    if (!state.ui.isCommandPressed) return;

    const oldScale = state.ui.scale;
    const newScale = Math.max(1, Math.min(oldScale + delta, 2));

    if (newScale === oldScale) return;

    // Find the mouse position relative to the board:
    const boardEl = document.getElementById('board');
    const rect = boardEl.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    // Compute how much that point moves under scale change
    //   newOffset = oldOffset - (mousePos) * (newScale/oldScale - 1)
    const factor = (newScale / oldScale) - 1;
    state.ui.offset.x -= mx * factor;
    state.ui.offset.y -= my * factor;

    state.ui.scale = newScale;

    clampOffset()
  }

  return {
    state,
    setCommandModifier,
    selectNode,
    selectEdge,
    addNode,
    removeNode,
    startBoardDrag,
    startNodeDrag,
    updateDrag,
    endDrag,
    startEdgeCreation,
    removeEdge,
    zoomBy,
  };
}
