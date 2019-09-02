module.exports = async function (cluster) {
  let node = await Node.create({
    hostname: `localhost`,
    cluster: cluster.id
  }).fetch()

  return node
}
