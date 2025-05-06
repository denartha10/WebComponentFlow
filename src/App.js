import van from 'vanjs-core'
import { Button } from './Button'
import { NodeComponent } from './NodeComponent'
import { EdgeComponent } from './EdgeComponent'


const { div } = van.tags


export const App = ({ board }) => {
  // NOTE: BOARD IS NOW INJECTED BY YOUR BUNDLER ENTRYPOINT

  // globally if the keydown is command key set command key state to down
  window.addEventListener('keydown', (e) => {
    board.setCommandModifier(e.metaKey || e.ctrlKey)
    board.setShiftModifier(e.shiftKey)

    if (e.key === "Backspace" || e.key === "Delete") {
      board.removeNode()
      board.removeEdge()
    }

    if (e.key === "z" && board.state.present.ui.isCommandPressed) {
      if (board.state.present.ui.isShiftPressed) {
        console.log("CTRL-SHIFT-Z")
        board.redo()
      } else {
        console.log("CTRL-Z")
        board.undo()
      }
    }
  })

  // globally if the keyup is command key set command key state to up
  window.addEventListener('keyup', (e) => { board.setCommandModifier(e.metaKey || e.ctrlKey); board.setShiftModifier(e.shiftKey) })

  return div(
    { id: 'boardWrapper', class: 'boardWrapper' },

    // NOTE: WHY DO I HAVE TO MAKE THE CUSTOM COMPONENT A FUNCTION FOR IT TO RENDER
    () => Button({
      showDelete: board.state.present.ui.selectedNode !== null,
      addNode: board.addNode,
      deleteNode: board.removeNode
    }),

    div(
      {
        id: 'board',
        class: () => board.state.present.ui.dragging.mode === 'board' ? 'boardDragging' : 'board',
        style: () => `
          transform-origin: 0 0;
          transform:
            translate(${board.state.present.ui.offset.x}px, ${board.state.present.ui.offset.y}px)
            scale(${board.state.present.ui.scale});
        `,
        onmousedown: (e) => { board.startBoardDrag(e) },
        onwheel: (e) => { e.preventDefault(); board.zoomBy(e.deltaY * 0.005, e) },
        onmousemove: (e) => board.updateDrag(e),
        onmouseup: (e) => board.endDrag(e)
      },

      () => div(
        board.state.present.nodes.map(n =>
          NodeComponent({
            ...n,
            selected: board.state.present.ui.selectedNode === n.id,
            onSelect: (e) => board.startNodeDrag(n.id, e),
            onMouseEnterInput: (nodeId, inputId) => {
              board.state.present.ui.dragging.isInInput = true
              if (board.state.present.ui.draftEdge === null) return;
              board.state.present.ui.draftEdge.nodeEndId = nodeId
              board.state.present.ui.draftEdge.inputId = inputId
            },
            onMouseLeaveInput: () => {
              board.state.present.ui.dragging.isInInput = false
              if (board.state.present.ui.draftEdge === null) return;
              board.state.present.ui.draftEdge.nodeEndId = null
              board.state.present.ui.draftEdge.inputId = null
            },
            onMouseDownOutput: board.startEdgeCreation
          })
        )
      ),

      () => board.state.present.ui.draftEdge === null ? "" : EdgeComponent({
        selected: false,
        isNew: true,
        position: {
          x0: board.state.present.ui.draftEdge.startPosition.x,
          y0: board.state.present.ui.draftEdge.startPosition.y,
          x1: board.state.present.ui.draftEdge.endPosition.x,
          y1: board.state.present.ui.draftEdge.endPosition.y
        },
        onSelect: () => { },
        onDelete: () => { }
      }),



      () => div(
        board.state.present.edges.map(e =>
          EdgeComponent({
            selected: board.state.present.ui.selectedEdge === e.id,
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
