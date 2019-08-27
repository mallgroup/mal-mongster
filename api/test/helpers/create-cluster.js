module.exports = async function () {
  let cluster = await Cluster.create({
    name: `testing cluster`,
    ssh: `ssh`,
    user: `admin`,
    password: `admin`,
    authKey: `authKey`,
    authenticationDatabase: `admin`
  }).fetch()

  return cluster
}
