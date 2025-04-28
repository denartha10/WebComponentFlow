import van from 'vanjs-core'
import { createBoardStore } from './store'
import { Button } from './Button'
import { NodeComponent } from './NodeComponent'
import { EdgeComponent } from './EdgeComponent'


const { div } = van.tags


export const App = () => {
  // Use the store
  const board = createBoardStore()

  // globally if the keydown is command key set command key state to down
  window.addEventListener('keydown', (e) => {
    board.setCommandModifier(e.metaKey || e.ctrlKey)
    if (e.key === "Backspace" || e.key === "Delete") {
      board.removeNode()
      board.removeEdge()
    }
  })

  // globally if the keyup is command key set command key state to up
  window.addEventListener('keyup', (e) => { board.setCommandModifier(e.metaKey || e.ctrlKey) })

  return div(
    { id: 'boardWrapper', class: 'boardWrapper' },

    // NOTE: WHY DO I HAVE TO MAKE THE CUSTOM COMPONENT A FUNCTION FOR IT TO RENDER
    () => Button({
      showDelete: board.state.ui.selectedNode !== null,
      addNode: board.addNode,
      deleteNode: board.removeNode
    }),

    div(
      {
        id: 'board',
        class: () => board.state.ui.dragging.mode === 'board' ? 'boardDragging' : 'board',
        style: () => `
          transform-origin: 0 0;
          transform:
            translate(${board.state.ui.offset.x}px, ${board.state.ui.offset.y}px)
            scale(${board.state.ui.scale});
        `,
        onmousedown: (e) => { board.startBoardDrag(e) },
        onwheel: (e) => { e.preventDefault(); board.zoomBy(e.deltaY * 0.005, e) },
        onmousemove: (e) => board.updateDrag(e),
        onmouseup: (e) => board.endDrag(e)
      },

      () => div(
        board.state.nodes.map(n =>
          NodeComponent({
            ...n,
            selected: board.state.ui.selectedNode === n.id,
            onSelect: (e) => board.startNodeDrag(n.id, e),
            onMouseEnterInput: (nodeId, inputId) => {
              board.state.ui.dragging.isInInput = true
              if (board.state.ui.draftEdge === null) return;
              board.state.ui.draftEdge.nodeEndId = nodeId
              board.state.ui.draftEdge.inputId = inputId
            },
            onMouseLeaveInput: () => {
              board.state.ui.dragging.isInInput = false
              if (board.state.ui.draftEdge === null) return;
              board.state.ui.draftEdge.nodeEndId = null
              board.state.ui.draftEdge.inputId = null
            },
            onMouseDownOutput: board.startEdgeCreation
          })
        )
      ),

      () => board.state.ui.draftEdge === null ? "" : EdgeComponent({
        selected: false,
        isNew: true,
        position: {
          x0: board.state.ui.draftEdge.startPosition.x,
          y0: board.state.ui.draftEdge.startPosition.y,
          x1: board.state.ui.draftEdge.endPosition.x,
          y1: board.state.ui.draftEdge.endPosition.y
        },
        onSelect: () => { },
        onDelete: () => { }
      }),



      () => div(
        board.state.edges.map(e =>
          EdgeComponent({
            selected: board.state.ui.selectedEdge === e.id,
            isNew: false,
            position: {
              x0: e.startPosition.x,
              y0: e.startPosition.y,
              x1: e.endPosition.x,
              y1: e.endPosition.y
            },
            onSelect: () => board.selectEdge(e.id),
            onDelete: () => board.removeEdge()
          })
        )
      )
    )
  )
}
