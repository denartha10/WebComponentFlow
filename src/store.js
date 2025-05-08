import * as vanX from 'vanjs-ext';
import {
  getCenterCoordinates
} from './utilities';

/// <reference path="./types.js" />


export function createBoardStore() {

  /** @type{State} */
  const state = vanX.reactive({
    past: [],
    present: {
      nodes: [],
      edges: [],
      ui: {
        scale: 1,
        offset: {
          x: 0,
          y: 0
        },
        isDarkMode: false,
        isCommandPressed: false,
        isShiftPressed: false,
        selectedNode: null,
        selectedEdge: null,
        draftEdge: null,
        dragging: {
          mode: null,
          nodeId: null,
          edgeId: null,
          isInInput: false,
          start: {
            x: 0,
            y: 0
          },
          origOffset: {
            x: 0,
            y: 0
          },
          origNodePos: {
            x: 0,
            y: 0
          },
          origEdges: [],
        }
      }
    },
    future: []
  });


  // Utility to deep-clone present for history (uses structuredClone if available)
  function snapshot(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function set(newPresent) {

    // Push a clone of current present into past
    state.past.push(snapshot(state.present));

    // Update in-place to preserve proxy
    Object.assign(state.present, newPresent);

    // Reset future
    state.future.length = 0;
  }

  function undo() {
    if (state.past.length === 0) return;
    // Save current to future
    state.future.unshift(snapshot(state.present));
    // Pop last from past and overwrite present
    const previous = state.past.pop();
    Object.assign(state.present, previous);
  }

  function redo() {
    if (state.future.length === 0) return;
    // Save current onto past
    state.past.push(snapshot(state.present));
    // Shift next from future and overwrite present
    const next = state.future.shift();
    Object.assign(state.present, next);
  }

  function clampOffset() {
    const wrapper = document.getElementById('boardWrapper');
    const boardEl = document.getElementById('board');
    if (!wrapper || !boardEl) return;

    const wrapW = wrapper.clientWidth;
    const wrapH = wrapper.clientHeight;

    // boardEl.clientWidth/Height is the unscaled size
    const boardW = boardEl.clientWidth * state.present.ui.scale;
    const boardH = boardEl.clientHeight * state.present.ui.scale;

    // We want 0 ≥ offset.x ≥ wrapW - boardW
    const minX = Math.min(0, wrapW - boardW);
    const maxX = 0;
    state.present.ui.offset.x = Math.max(minX, Math.min(maxX, state.present.ui.offset.x));

    // And similarly for Y
    const minY = Math.min(0, wrapH - boardH);
    const maxY = 0;
    state.present.ui.offset.y = Math.max(minY, Math.min(maxY, state.present.ui.offset.y));
  }


  function setCommandModifier(isPressed) {
    state.present.ui.isCommandPressed = isPressed;
  }

  function setShiftModifier(isPressed) {
    state.present.ui.isShiftPressed = isPressed;
  }

  function selectNode(nodeId) {
    state.present.ui.selectedEdge = null;
    state.present.ui.selectedNode = nodeId;
  }

  function selectEdge(edgeId) {
    state.present.ui.selectedNode = null;
    state.present.ui.selectedEdge = edgeId;
  }

  function addNode(numberInputs, numberOutputs, metadata = {}) {
    const wrapper = document.getElementById('boardWrapper');
    const rect = wrapper.getBoundingClientRect();

    // 1) Compute board-space bounds of visible area:
    const xMin = (rect.left - state.present.ui.offset.x) / state.present.ui.scale;
    const yMin = (rect.top - state.present.ui.offset.y) / state.present.ui.scale;
    const xMax = ((rect.left + wrapper.clientWidth) - state.present.ui.offset.x) / state.present.ui.scale;
    const yMax = ((rect.top + wrapper.clientHeight) - state.present.ui.offset.y) / state.present.ui.scale;

    // 2) Pick a random point inside those board-space bounds:
    const x = Math.random() * (xMax - xMin) + xMin;
    const y = Math.random() * (yMax - yMin) + yMin;

    // 3 new node
    const node = {
      id: `node_${Math.random().toString(36).slice(2, 8)}`,
      numberInputs,
      numberOutputs,
      position: {
        x,
        y
      },
      metadata: metadata
    }

    // 4) Create the node at that board-space point:
    state.present.nodes.push(node);

    set({ ...state.present })

    return node
  }

  function removeNode(nodeId = state.present.ui.selectedNode) {
    if (!nodeId) return;
    state.present.edges = state.present.edges.filter(e => e.nodeEndId !== nodeId && e.nodeStartId !== nodeId);
    state.present.nodes = state.present.nodes.filter(n => n.id !== nodeId);
    selectNode(null);

    set({ ...state.present })
  }

  function addEdge(draft) {
    state.present.edges.push({
      ...draft
    });
  }

  function removeEdge(edgeId = state.present.ui.selectedEdge) {
    if (!edgeId) return;
    state.present.edges = state.present.edges.filter(e => e.id !== edgeId);
    selectEdge(null);

    set({ ...state.present })
  }


  function startBoardDrag({
    x,
    y
  }) {
    state.present.ui.selectedNode = null;
    state.present.ui.selectedEdge = null;
    state.present.ui.dragging = {
      mode: 'board',
      start: {
        x,
        y
      },
      origOffset: {
        ...state.present.ui.offset
      }
    };
  }


  function startNodeDrag(nodeId, {
    x,
    y
  }) {
    selectNode(nodeId);
    const node = state.present.nodes.find(n => n.id === nodeId);
    state.present.ui.dragging = {
      mode: 'node',
      nodeId,
      start: {
        x,
        y
      },
      origOffset: {
        ...state.present.ui.offset
      },
      origNodePos: {
        ...node.position
      },
      origEdges: state.present.edges
        .filter(e => e.nodeStartId === nodeId || e.nodeEndId === nodeId)
        .map(e => ({
          ref: e,
          origStart: {
            ...e.startPosition
          },
          origEnd: {
            ...e.endPosition
          }
        }))
    };
  }

  function startEdgeCreation(nodeId, outputId, {
    x,
    y
  }) {
    selectEdge(null);
    selectNode(null);
    const sx = (x - state.present.ui.offset.x) / state.present.ui.scale;
    const sy = (y - state.present.ui.offset.y) / state.present.ui.scale;
    state.present.ui.draftEdge = {
      id: '',
      nodeStartId: nodeId,
      outputId,
      nodeEndId: '',
      inputId: '',
      startPosition: {
        x: sx,
        y: sy
      },
      endPosition: {
        x: sx,
        y: sy
      }
    };
    state.present.ui.dragging.mode = 'edge';
  }

  function updateDrag({
    x,
    y
  }) {
    const d = state.present.ui.dragging;
    if (!d.mode) return;

    if (d.mode === 'node') {
      const dx = (x - d.start.x) / state.present.ui.scale;
      const dy = (y - d.start.y) / state.present.ui.scale;
      const node = state.present.nodes.find(n => n.id === d.nodeId);
      node.position = {
        x: d.origNodePos.x + dx,
        y: d.origNodePos.y + dy
      };
      d.origEdges.forEach(edgeSnap => {
        if (edgeSnap.ref.nodeStartId === d.nodeId) {
          edgeSnap.ref.startPosition = {
            x: edgeSnap.origStart.x + dx,
            y: edgeSnap.origStart.y + dy
          };
        }
        if (edgeSnap.ref.nodeEndId === d.nodeId) {
          edgeSnap.ref.endPosition = {
            x: edgeSnap.origEnd.x + dx,
            y: edgeSnap.origEnd.y + dy
          };
        }
      });
    } else if (d.mode === 'board') {
      const dx = x - d.start.x;
      const dy = y - d.start.y;

      state.present.ui.offset.x = d.origOffset.x + dx
      state.present.ui.offset.y = d.origOffset.y + dy

      clampOffset()
    } else if (d.mode === 'edge' && state.present.ui.draftEdge) {
      // get wrapper origin
      const wrapper = document.getElementById('boardWrapper');
      const wrapRect = wrapper.getBoundingClientRect();

      // convert event.clientX/Y → wrapper-local coords
      const localX = x - wrapRect.left;
      const localY = y - wrapRect.top;

      state.present.ui.draftEdge.endPosition = {
        x: (localX - state.present.ui.offset.x) / state.present.ui.scale,
        y: (localY - state.present.ui.offset.y) / state.present.ui.scale
      };
    }
  }

  function endDrag() {
    const d = state.present.ui.dragging;

    if (d.mode === 'edge' && d.isInInput && state.present.ui.draftEdge) {
      const draft = state.present.ui.draftEdge;
      const { centerX, centerY } = getCenterCoordinates(document.getElementById(draft.inputId));

      addEdge({
        ...draft,
        id: `edge_${draft.nodeStartId}_${draft.outputId}_${draft.nodeEndId}_${draft.inputId}`,
        endPosition: {
          // centerX/centerY are now _inside_ the wrapper,
          // so subtract your pan-offset and divide by scale:
          x: (centerX - state.present.ui.offset.x) / state.present.ui.scale,
          y: (centerY - state.present.ui.offset.y) / state.present.ui.scale
        }
      });

      set({ ...state.present })
    }



    state.present.ui.dragging = {
      mode: null,
      nodeId: null,
      edgeId: null,
      isInInput: false,
      start: {
        x: 0,
        y: 0
      },
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

    state.present.ui.draftEdge = null;

    if (d.mode === "node") {
      set({ ...state.present })
    }

  }

  function zoomBy(delta, event) {
    if (!state.present.ui.isCommandPressed) return;

    const oldScale = state.present.ui.scale;
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
    state.present.ui.offset.x -= mx * factor;
    state.present.ui.offset.y -= my * factor;

    state.present.ui.scale = newScale;

    clampOffset()
  }

  function setDarkMode(isdarkmode) {
    state.present.ui.isDarkMode = isdarkmode
  }

  function getModel() {
    return {
      nodes: snapshot(state.present.nodes),
      edges: snapshot(state.present.edges),
    }
  }


  return {
    state,
    setCommandModifier,
    setShiftModifier,
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
    setDarkMode,
    getModel,

    undo,
    redo
  }
};
