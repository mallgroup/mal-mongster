export const findById = (state) => (id) => {
  return state.items.find(node => node.id === id)
}
