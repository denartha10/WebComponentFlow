import van from 'vanjs-core';

//NOTE: There is a lack of prevPosition in the models for edges and nodes. I am interested in why

/**
 * @typedef {Object} NodeModel
 * @property {string} id                     - Unique identifier for the node.
 * @property {number} numberInputs          - How many input ports the node has.
 * @property {number} numberOutputs         - How many output ports the node has.
 * @property {{ x: number, y: number }} position           - Current node position.
 * @property {string[]} inputEdgeIds        - IDs of edges connecting into this node.
 * @property {string[]} outputEdgeIds       - IDs of edges connecting out of this node.
 */

/**
 * @typedef {Object} EdgeModel
 * @property {string} id                     - Unique identifier for the edge.
 * @property {string} nodeStartId           - ID of the node where the edge starts.
 * @property {string} nodeEndId             - ID of the node where the edge ends.
 * @property {number} inputIndex            - Which input port index it connects on the target node.
 * @property {number} outputIndex           - Which output port index it comes from on the source node.
 * @property {{ x: number, y: number }} startPosition      - Coordinates of the edge’s start point.
 * @property {{ x: number, y: number }} endPosition        - Coordinates of the edge’s end point.
 */

/**
 * @typedef {Object} NewEdgeDraft
 * @property {string} nodeStartId           - Node from which the new edge originates.
 * @property {number} outputIndex           - Output port index on the start node.
 * @property {{ x: number, y: number }} startPosition      - Temporary start point (mouse‑down).
 * @property {{ x: number, y: number }} endPosition        - Temporary end point (mouse move).
 */

/**
 * @typedef {Object} UIState
 * @property {boolean} isGrabbing           - Are we currently panning the board?
 * @property {number} scale                 - Current zoom level of the board.
 * @property {{ x: number, y: number }} clickedPosition   - Last mouse‑down coords for drag math.
 * @property {boolean} isCommandPressed     - Is ctrl/cmd held for zoom shortcuts?
 * @property {string|null} selectedNode     - ID of the node currently highlighted, if any.
 * @property {string|null} selectedEdge     - ID of the edge currently highlighted, if any.
 * @property {{ nodeId: string, inputIndex: number, position: { x: number, y: number } }|null} insideInput
 *                                           - Hover state over an input port.
 * @property {NewEdgeDraft|null} newEdgeDraft - In‑flight edge creation data, before commit.
 */

/**
 * @typedef {Object} BoardState
 * @property {NodeModel[]} nodes           - All node models in the board.
 * @property {EdgeModel[]} edges           - All finalized edge models in the board.
 * @property {UIState} ui                   - All transient UI and interaction flags.
 */

const initialState /** @type {BoardState} */ = {
  nodes: [],
  edges: [],
  ui: {
    isGrabbing: false,
    scale: 1,
    clickedPosition: { x: -1, y: -1 },
    isCommandPressed: false,
    selectedNode: null,
    selectedEdge: null,
    insideInput: null,
    newEdgeDraft: null
  }
};

export const boardState = van.state(initialState);
