import './style.css'
import van from 'vanjs-core'
import { App } from "./App";
import { createBoardStore } from "./store";

export default function HTMLFlow({
  container = document.body, // DOM node or selector
  darkMode = false // initial theme
} = {}) {
  console.log("1) create your board store")
  // 1) create your board store
  const board = createBoardStore()

  console.log("2) mount the App into the container")
  // 2) mount the App into the container
  const mountPoint =
    typeof container === 'string'
      ? document.querySelector(container)
      : container

  van.add(
    mountPoint, // pass board via props or import it directly
    App({ board })
  )


  console.log("3) theme: add a class on <html> or <body>, toggle as needed")
  //// 3) theme: add a class on <html> or <body>, toggle as needed
  //function applyTheme(isDark) {
  //  board.setDarkMode(isDark)
  //}
  //
  //// expose only what you want
  //applyTheme(darkMode)

  // expose only what you want
  return {
    addNode: board.addNode,
    //toggleDarkMode() {
    //  darkMode = !darkMode
    //  applyTheme(darkMode)
    //},
    // you could also expose undo/redo, removeNode, ,etc
    // but I am not going to
  }
}
