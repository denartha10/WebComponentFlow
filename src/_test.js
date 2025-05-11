import WebComponentFlow from "./index.js";

const flow = WebComponentFlow({
  container: '#app'
})

flow.addNode(1, 0, {})
flow.addNode(0, 1, {})
