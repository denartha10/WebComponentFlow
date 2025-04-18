import van from 'vanjs-core';
import { Button } from './Button';
import { NodeComponent } from './NodeComponent';
import { EdgeComponent } from './EdgeComponent';

/**
  * @typedef {Object} Node
  * @property {string} id
  * @property {number} numberInputs
  * @property {number} numberOutputs
  * @property {{val: {x: number, y:number}}} prevPosition
  * @property {{val: {x: number, y:number}}} currPosition
  * @property {{val: string[], rawVal: string[], oldVal: string[]}} inputEdgeIds
  * @property {{val: string[], rawVal: string[], oldVal: string[]}} outputEdgeIds
  */

/**
  * @typedef {Object} Edge
  * @property {string} id
  * @property {string} nodeStartId
  * @property {string} nodeEndId
  * @property {number} inputIndex
  * @property {number} outputIndex
  * @property {{val: {x: number, y:number}}} prevStartPosition
  * @property {{val: {x: number, y:number}}} currStartPosition
  * @property {{val: {x: number, y:number}}} prevEndPosition
  * @property {{val: {x: number, y:number}}} currEndPosition
  */

/**
  * @typedef {Object} InsideInput
  * @property {string} nodeId
  * @property {number} inputIndex
  * @property {number} positionX 
  * @property {number} positionY */

const { div } = van.tags;

// TODO: Understand the difference between state.val and state in van js
// TODO: How do I make the formatting better in javascript files with wider tabs

export const App = () => {
  /** @type {{val: boolean, rawVal: boolean, oldVal: boolean}} */
  const grabbing = van.state(false);

  /** @type {{val: number, rawVal: number, oldVal: number}} */
  const scale = van.state(1);

  /** @type {{val: {x: number, y:number}, rawVal: {x: number, y:number}, oldVal: {x: number, y:number}}} */
  const clickedPosition = van.state({ x: -1, y: -1 });

  /** @type {{val: boolean, rawVal: boolean, oldVal: boolean}} */
  const isCommandPress = van.state(false)

  /** @type {{val: Node[], rawVal: Node[], oldVal: Node[]}} */
  const nodes = van.state([]);

  /** @type {{val: Node, rawVal: Node, oldVal: Node}|null} */
  const selectedNode = van.state(null);

  /** @type {{val: boolean, rawVal: boolean, oldVal: boolean}} */
  const showDeleteButton = van.derive(() => selectedNode.val !== null);

  /** @type {{val: Edge, rawVal: Edge, oldVal: Edge}|null} */
  const newEdge = van.state(null)

  /** @type {{val: Array<Edge>, rawVal: Array<Edge>, oldVal: Array<Edge>}} */
  const edges = van.state([])

  /** @type {{val: Edge, rawVal: Edge, oldVal: Edge}} */
  const selectedEdge = van.state(null)

  /** @type {{val: InsideInput, rawVal: InsideInput, oldVal: InsideInput}|null}*/
  const insideInput = van.state(null)



  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) {
      isCommandPress.val = true
    }
  })

  window.addEventListener('keyup', (e) => {
    if (!e.metaKey || !e.ctrlKey) {
      isCommandPress.val = false
    }
  })


  // Event Handlers
  const handleMouseWheel = (event) => {
    if (isCommandPress.val) {
      selectedNode.val = null
      scale.val = Math.min(Math.max(1, scale.val + event.deltaY * 0.005), 2);
      event.currentTarget.style.transform = `scale(${scale.val})`;
      event.currentTarget.style.marginTop = `${(scale.val - 1) * 50}vh`;
      event.currentTarget.style.marginLeft = `${(scale.val - 1) * 50}vw`;
    }
  };

  const handleOnClickAdd = (numberInputs, numberOutputs) => {
    const randomX = Math.random() * window.innerWidth;
    const randomY = Math.random() * window.innerHeight;
    const position = { x: randomX, y: randomY };

    const previousPosition = van.state({ ...position })
    const currentPosition = van.state({ ...position })
    const inputEdgeIds = van.state([])
    const outputEdgeIds = van.state([])

    nodes.val = [
      ...nodes.val,
      {
        id: `node_${Math.random().toString(36).substring(2, 8)}`,
        numberInputs,
        numberOutputs,
        prevPosition: previousPosition,
        currPosition: currentPosition,
        inputEdgeIds: inputEdgeIds,
        outputEdgeIds: outputEdgeIds
      },
    ];


  };
  const handleOnClickDelete = () => {
    const node = nodes.val.find(n => n.id === selectedNode.val)

    if (!node) {
      selectedNode.val = null;
      return;
    }

    edges.val = [...edges.val.filter(e => !(e.nodeEndId === node.id || e.nodeStartId === node.id))]
    nodes.val = [...nodes.val.filter(n => n.id !== selectedNode.val)];
    selectedNode.val = null;
  };

  const handleOnMouseDownNode = (id, e) => {
    selectedNode.val = id
    clickedPosition.val = { x: e.x, y: e.y }
    selectedEdge.val = null

    const node = nodes.val.find(n => n.id === selectedNode.val)
    if (node) {
      node.prevPosition.val = {
        x: node.currPosition.val.x * scale.val,
        y: node.currPosition.val.y * scale.val
      }

      for (let i = 0; i < node.inputEdgeIds.val.length; i++) {
        const edgeId = node.inputEdgeIds.val[i]
        const edge = edges.val.find(e => e.id === edgeId)
        if (edge) {
          edge.prevEndPosition.val = {
            x: edge.currEndPosition.val.x * scale.val,
            y: edge.currEndPosition.val.y * scale.val
          }
        }
      }

      for (let i = 0; i < node.outputEdgeIds.val.length; i++) {
        const edgeId = node.outputEdgeIds.val[i]
        const edge = edges.val.find(e => e.id === edgeId)
        if (edge) {
          edge.prevStartPosition.val = {
            x: edge.currStartPosition.val.x * scale.val,
            y: edge.currStartPosition.val.y * scale.val
          }
        }
      }

    }
  };




  const handleOnMouseDownOutput = (outputPositionX, outputPositionY, nodeId, outputIndex) => {
    selectedNode.val = null
    selectedEdge.val = null

    const boardWrapperElement = document.getElementById('boardWrapper')

    if (boardWrapperElement) {
      newEdge.val = {
        id: '',
        nodeStartId: nodeId,
        outputIndex: outputIndex,
        nodeEndId: '',
        inputIndex: -1,
        prevStartPosition: van.state({
          x: (outputPositionX + boardWrapperElement.scrollLeft) / scale.val,
          y: (outputPositionY + boardWrapperElement.scrollTop) / scale.val
        }),
        currStartPosition: van.state({
          x: (outputPositionX + boardWrapperElement.scrollLeft) / scale.val,
          y: (outputPositionY + boardWrapperElement.scrollTop) / scale.val
        }),
        prevEndPosition: van.state({
          x: (outputPositionX + boardWrapperElement.scrollLeft) / scale.val,
          y: (outputPositionY + boardWrapperElement.scrollTop) / scale.val
        }),
        currEndPosition: van.state({
          x: (outputPositionX + boardWrapperElement.scrollLeft) / scale.val,
          y: (outputPositionY + boardWrapperElement.scrollTop) / scale.val
        })
      }
    }


  };

  const handleOnMouseEnterInput = (inputPositionX, inputPositionY, nodeId, inputIndex) => {
    insideInput.val = { nodeId, inputIndex, positionX: inputPositionX, positionY: inputPositionY }
  };

  const handleOnMouseLeaveInput = (nodeId, inputIndex) => {
    if (insideInput.val?.nodeId === nodeId && insideInput.val?.inputIndex === inputIndex) {
      insideInput.val = null
    }
  };









  const boardMouseDown = (e) => {
    selectedNode.val = null
    selectedEdge.val = null
    grabbing.val = true;
    clickedPosition.val = { x: e.x, y: e.y };
  };

  const boardMouseUp = () => {
    grabbing.val = false;
    clickedPosition.val = { x: -1, y: -1 };

    if (newEdge.val !== null && insideInput.val === null) {
      newEdge.val = null
    }


    if (newEdge.val !== null && insideInput.val !== null) {
      const nodeStartId = newEdge.val.nodeStartId
      const nodeEndId = insideInput.val.nodeId

      const nodeStart = nodes.val.find(n => n.id === nodeStartId)
      const nodeEnd = nodes.val.find(n => n.id === nodeEndId)
      const boardWrapperElement = document.getElementById('boardWrapper')

      if (nodeStart && nodeEnd && boardWrapperElement) {
        const edgeId = `edge_${nodeStart.id}_${newEdge.val.outputIndex}_${nodeEnd.id}_${insideInput.val.inputIndex}`

        if (nodeStart.outputEdgeIds.val.includes(edgeId) && nodeEnd.inputEdgeIds.val.includes(edgeId)) {
          newEdge.val = null;
          return
        }

        nodeStart.outputEdgeIds.val = [
          ...nodeStart.outputEdgeIds.val,
          edgeId
        ]
        nodeEnd.inputEdgeIds.val = [
          ...nodeEnd.inputEdgeIds.val,
          edgeId
        ]

        newEdge.val.prevStartPosition.val = {
          x: (newEdge.val.currStartPosition.val.x + boardWrapperElement.scrollLeft) / scale.val,
          y: (newEdge.val.currStartPosition.val.y + boardWrapperElement.scrollTop) / scale.val,
        }

        newEdge.val.prevEndPosition.val = {
          x: (insideInput.val.positionX + boardWrapperElement.scrollLeft) / scale.val,
          y: (insideInput.val.positionY + boardWrapperElement.scrollTop) / scale.val
        }

        newEdge.val.currEndPosition.val = {
          x: (insideInput.val.positionX + boardWrapperElement.scrollLeft) / scale.val,
          y: (insideInput.val.positionY + boardWrapperElement.scrollTop) / scale.val
        }

        // Add new edge
        edges.val = [
          ...edges.val,
          {
            ...newEdge.val,
            id: edgeId,
            nodeEndId: nodeEnd.id,
            inputIndex: insideInput.val.inputIndex
          }
        ]

        newEdge.val = null;

      }
    }

    insideInput.val = null
  };

  const boardMouseMove = (e) => {
    if (clickedPosition.val.x >= 0 && clickedPosition.val.y >= 0) {
      const deltaX = e.x - clickedPosition.val.x;
      const deltaY = e.y - clickedPosition.val.y;

      if (selectedNode.val !== null) {
        const deltaX = e.x - clickedPosition.val.x;
        const deltaY = e.y - clickedPosition.val.y;

        const node = nodes.val.find(n => n.id === selectedNode.val)
        if (node) {
          // update node position
          node.currPosition.val = {
            x: (node.prevPosition.val.x + deltaX) / scale.val,
            y: (node.prevPosition.val.y + deltaY) / scale.val
          }

          for (let i = 0; i < node.inputEdgeIds.val.length; i++) {
            const edgeId = node.inputEdgeIds.val[i]
            const edge = edges.val.find(e => e.id === edgeId)
            if (edge) {
              edge.currEndPosition.val = {
                x: (edge.prevEndPosition.val.x + deltaX) / scale.val,
                y: (edge.prevEndPosition.val.y + deltaY) / scale.val
              }
            }
          }

          for (let i = 0; i < node.outputEdgeIds.val.length; i++) {
            const edgeId = node.outputEdgeIds.val[i]
            const edge = edges.val.find(e => e.id === edgeId)
            if (edge) {
              edge.currStartPosition.val = {
                x: (edge.prevStartPosition.val.x + deltaX) / scale.val,
                y: (edge.prevStartPosition.val.y + deltaY) / scale.val
              }
            }

          }
        }
      }

      else {
        const boardWrapperElement = document.getElementById('boardWrapper');
        if (boardWrapperElement) {
          boardWrapperElement.scrollBy(-deltaX, -deltaY);
          clickedPosition.val = { x: e.x, y: e.y };
        }
      }
    }

    if (newEdge.val !== null) {
      const boardWrapperElement = document.getElementById('boardWrapper')
      if (boardWrapperElement) {
        newEdge.val.currEndPosition.val = {
          x: (e.x + boardWrapperElement.scrollLeft) / scale.val,
          y: (e.y + boardWrapperElement.scrollTop) / scale.val
        }
      }
    }
  };







  const handleOnMouseDownEdge = (id) => {
    selectedNode.val = null
    selectedEdge.val = id

  }

  const handleOnDeleteEdge = () => {
    const edge = edges.val.find(e => e.id === selectedEdge.val)

    if (!edge) {
      selectedEdge.val = null;
      return;
    }

    const nodeStart = nodes.val.find(n => n.id === edge.nodeStartId)
    if (nodeStart) {
      nodeStart.outputEdgeIds.val = [...nodeStart.outputEdgeIds.val.filter(e => e !== edge.id)]
    }

    const nodeEnd = nodes.val.find(n => n.id === edge.nodeEndId)
    if (nodeEnd) {
      nodeEnd.inputEdgeIds.val = [...nodeEnd.inputEdgeIds.val.filter(e => e !== edge.id)]
    }

    edges.val = [...edges.val.filter(e => e.id !== selectedEdge.val)]
    selectedEdge.val = null;
  };





  // Render App
  return div(
    { class: 'boardWrapper', id: 'boardWrapper' },

    // Delete Button & Add Button
    () => Button({
      showDelete: showDeleteButton.val,
      onClickAdd: handleOnClickAdd,
      onClickDelete: handleOnClickDelete,
    }),

    // Board with nodes
    div(
      {
        class: () => grabbing.val ? 'boardDragging' : 'board',
        id: 'board',
        onwheel: handleMouseWheel,
        onmousedown: boardMouseDown,
        onmouseup: boardMouseUp,
        onmousemove: boardMouseMove,
      },

      // Node rendering
      () =>
        div(
          nodes.val.map((node) =>
            NodeComponent({
              id: node.id,
              x: node.currPosition.val.x,
              y: node.currPosition.val.y,
              numberInputs: node.numberInputs,
              numberOutputs: node.numberOutputs,
              selected: selectedNode.val === node.id,
              onMouseDownNode: handleOnMouseDownNode,
              onMouseDownOutput: handleOnMouseDownOutput,
              onMouseEnterInput: handleOnMouseEnterInput,
              onMouseLeaveInput: handleOnMouseLeaveInput,
            })
          )
        ),

      // new edge rendering
      () => div(
        newEdge.val === null ? "" : EdgeComponent(
          {
            selected: false,
            isNew: true,
            position: {
              x0: newEdge.val.currStartPosition.val.x,
              y0: newEdge.val.currStartPosition.val.y,
              x1: newEdge.val.currEndPosition.val.x,
              y1: newEdge.val.currEndPosition.val.y,
            },
            onMouseDownEdge: () => { },
            oonClickDelete: () => { }
          }
        )
      ),


      // edge rendering
      () => div(
        edges.val.map(
          edge => EdgeComponent({
            selected: selectedEdge.val === edge.id,
            isNew: false,
            position: {
              x0: edge.currStartPosition.val.x,
              y0: edge.currStartPosition.val.y,
              x1: edge.currEndPosition.val.x,
              y1: edge.currEndPosition.val.y
            },
            onMouseDownEdge: () => handleOnMouseDownEdge(edge.id),
            onClickDelete: () => handleOnDeleteEdge(edge.id)
          })
        )
      )
    )
  )
};
