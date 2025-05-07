import './style.css'
import van from 'vanjs-core'
import { App } from "./App";
import { createBoardStore } from "./store";

export default function HTMLFlow({
  container = document.body, // DOM node or selector
  darkMode = false // initial theme
} = {}) {

  // 1) create your board store
  const board = createBoardStore()

  // 2) mount the App into the container
  const mountPoint =
    typeof container === 'string'
      ? document.querySelector(container)
      : container

  van.add(
    mountPoint, // pass board via props or import it directly
    App({ board })
  )

  // set the theme
  board.setDarkMode(darkMode)

  // expose only what you want
  return {
    addNode: (numberInputs, numberOutputs, metadata = {}) => board.addNode(numberInputs, numberOutputs, metadata),
    removeNode: (nodeObject) => board.removeNode(nodeObject.id),

    //addEdge: (input, output, metadata) => { },
    //removeEdge: (edgeObject) => board.removeEdge(edgeObject.id),

    toggleDarkMode: () => { darkMode = !darkMode; board.setDarkMode(darkMode) },
    getModel: () => board.getModel()

    // you could also expose undo/redo, removeNode, ,etc
  }
}
