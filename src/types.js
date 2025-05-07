/**
 * @typedef {Object} Position
 * @property {number} x - The x coordinate
 * @property {number} y - The y coordinate
 */

/**
 * @typedef {Object} CustomNode
 * @property {string} id - Unique identifier for the node
 * @property {Position} position - Position of the node
 * @property {number} numberInputs - Number of input connections
 * @property {number} numberOutputs - Number of output connections
 * @property {object} metadata
 */

/**
 * @typedef {Object} Edge
 * @property {string} id - Unique identifier for the edge
 * @property {Position} startPosition - Start position of the edge
 * @property {Position} endPosition - End position of the edge
 * @property {string} nodeStartId - ID of the start node
 * @property {string} outputId
 * @property {string} nodeEndId - ID of the end node
 * @property {string} inputId
 * @property {object} metadata
 */

/**
 * @typedef {'node' | 'board' | 'edge' | null} DragMode
 */
/**
 * @typedef {Object} OrigEdgeSnapshot
 * @property {Edge} ref - Unique identifier for the edge
 * @property {Position} origStart - Original start position of the edge at drag start
 * @property {Position} origEnd - Original end position of the edge at drag start
 */

/**
 * @typedef {Object} Dragging
 * @property {DragMode} mode - Current dragging mode
 * @property {string|null} nodeId - ID of the dragged node (if any)
 * @property {string|null} edgeId - ID of the dragged edge (if any)
 * @property {boolean} isInInput - Whether the drag ended over an input port
 * @property {Position} start - Drag start position (screen coordinates)
 * @property {Position} origOffset - Original board offset before drag
 * @property {Position} origNodePos - Original node position before drag
 * @property {OrigEdgeSnapshot[]} origEdges - Array of edge snapshots capturing original start/end positions of edges connected to the dragged node
 */

/**
 * @typedef {Object} UIState
 * @property {number} scale - Zoom level (typically 1 to 2)
 * @property {Position} offset - Pan offset of the board
 * @property {boolean} isDarkMode - Dark Mode on or off
 * @property {boolean} isCommandPressed - Whether Cmd/Ctrl is pressed
 * @property {boolean} isShiftPressed - Whether shift is pressed
 * @property {string | null} selectedNode - Currently selected node ID
 * @property {string | null} selectedEdge - Currently selected edge ID
 * @property {Edge | null} draftEdge - Draft edge information
 * @property {Dragging} dragging - Information about the current drag state
 */

/**
 * @typedef {Object} StateObject
 * @property {CustomNode[]} nodes - Array of all nodes
 * @property {Edge[]} edges - Array of all edges
 * @property {UIState} ui - UI-specific state
 */

/**
  * @typedef {Object} State
  * @property {StateObject[]} past 
  * @property {StateObject} present
  * @property {StateObject[]} future
 */

/**
  * @typedef {(numberInput: number, numberOutputs: number) => void} AddNode
  */

/**
  * @typedef {() => void} RemoveNode
  */

/**
  * @typedef {(nodeId: string | null) => void} SelectNode
  */


/**
  * @typedef {(isPressed: boolean) => void} SetCommandModifier
  */


/**
  * @typedef {(edgeId: string | null) => void} SelectEdge
  */


/**
  * @typedef {(delta: number) => void} ZoomBy
  */


/**
  * @typedef {(nodeId: string, outputIndex: string, startPos: {x: number, y: number}) => void} StartEdgeCreation
  */


/**
  * @typedef {(endPos: {x: number, y: number}) => void} UpdateEdgeCreation
  */


/**
  * @typedef {(edgeDraft: Edge) => void} CommitEdge
  */

/**
  * @typedef {(edgeId: string) => void} RemoveEdge
  */
