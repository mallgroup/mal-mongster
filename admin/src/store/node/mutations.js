export const add = (state, nodeInfo) => {
  if (!state.items.some((node) => nodeInfo.id === node.id)) {
    // push new one in case it does not exists yet in nodes
    state.items.push(nodeInfo)
  } else {
    // update existing
    state.items = state.items.map((currentNode) => {
      if (currentNode.id === nodeInfo.id) {
        currentNode = nodeInfo
      }
      return currentNode
    })
  }
}

export const remove = (state, nodeInfo) => {
  state.items = state.items.filter((currentNode) => currentNode.id !== nodeInfo.id)
}
