## Overview

WebComponentFlow is a lightweight, minimal-dependency flowboard library built with VanJS. It lets you add draggable nodes and connect them with edges in any HTML page via a simple global factory.

## Features

* Add, remove, and connect nodes programmatically
* Zoom and pan the board with keyboard modifiers
* Dark mode support via CSS class toggle
* Bundled with VanJS so consumers don’t need separate dependencies
* Bundled with default CSS so consumers do not need to style themselves
* UMD build for easy inclusion via CDN or npm

## Installation

### Via npm

```bash
npm install @leanacht/webcomponent-flow
```

### Via CDN

#### UNPKG

```html
<script src="https://unpkg.com/@leanacht/webcomponent-flow/dist/flow-app.umd.js"></script>
```

## Quick Start

```html
<body>
  <div id="board" style="width:100%; height:100vh"></div>

  <script>
    // Initialize the board
    const flow = WebComponentFlow({
      container: '#board',
      darkMode: false
    });

    // Add a new node with 2 inputs, 1 output
    flow.addNode(2, 1);
  </script>
</body>
```

## API

### `WebComponentFlow(options)`

Creates and mounts a new flow board.

| Option      | Type                  | Default         | Description                       |
| ----------- | --------------------- | --------------- | --------------------------------- |
| `container` | String or HTMLElement | `document.body` | Selector or element to mount into |
| `darkMode`  | Boolean               | `false`         | Whether to start in dark mode     |

Returns an object with methods:

* `addNode(numInputs, numOutputs)` — Add a node.
* `removeNode()` — Remove the selected node.
* `addEdge(nodeOutput, nodeInput)` — (Internal) Commit a draft edge.
* `removeEdge()` — Remove the selected edge.
* `undo()` — Undo last action.
* `redo()` — Redo last undone action.

## Dark Mode

Toggle dark mode by adding/removing the `dark` class on `<html>` or `<body>`. The library exposes `toggleDarkMode()` if needed.

## Development

Clone the repo, install dependencies, and run:

```bash
nom install
npm run dev   # serve locally
npm run build # produce dist/*
```

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a pull request

## License

MIT © leanacht
