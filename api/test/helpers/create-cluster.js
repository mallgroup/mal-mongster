const strongCrypter = require('strong-cryptor')

module.exports = async function () {
  let key = await Configuration.findOne({
    option: `encryption_key`
  })

  // random 64 bytes string
  const authKey = strongCrypter.encrypt('EAzA49DQxm7cnjUUnX6YrLg63qb53d73q7utcMZJ6nL8aCxLHUyQrajmdBqJxZqF', key.value, 'hex')

  // some random SSH key generated online
  const ssh = strongCrypter.encrypt(`
  -----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAoemXP1PpRJjGvPYeIf36/nT6F/xnG46MjL6xnzjukrGlKx5O
3tbcMcML3J3qaeBr7E66FsEaGdGUmy9gm8gHHbOiplmfwaLjLO3WE2AFUBhwc3Nj
chbDlcKw5gaymaGK1zk6emoK2UlauRZ2/SU1yw8YpuVL9maHTznl76yIGmCRVCQa
lX4ei+JnTwW2DSY9gcjTP2rVUqn+3LJwurgvo5jvd9+/VInllXAVCvsKksVGCBfs
2GZF8npTFijgVsFlNIxxt89T9xbtW8Fk3zQSYUkZwvq0U/+NaSn/v9RZuogxQ7qF
Frk07HBQj0zGEh3+Z8zxrmOP/iypwPz737KXBwIDAQABAoIBAGyBDQG8avO0amLR
kMn42Y5SuBMA69wUwG3FkWUBkyetcuGdcv90/6U9b6KOFTyUz95Rt/VtvN8Wiz8g
Fd7vwo0OB+7w2tW6IgHG9RKQ456Uci98YWVgifu/uCq+zEuWbWPkDyNgExsgRHMK
8fydRhppaHzX5vseJIlcZJIkjiUWBVrwj3c9DL1ID7/rkWXv5donOt4472aCZ1ZP
uqBTXMn2UkSjlWVHf5KbJIlYIrYjgexyRPKRMYAb34kPujRHjBesA+JNkTB+bua6
aU8NptJsWwf7VnY7lw81umZn2I1En0mUtamIlHzeGTmMJt/plulTJRL7N+iUHl6f
ofuUC4kCgYEA46IIXt/z15oE7ae5dul3n4eXDr4xivrfUEzzEBJX9mxvIEOczgJ8
m78AD0HjheJeST/KajlIk6LSJjjuf/qZYcmhbfGrAWXXAhmYYOhOsSgPWPspwEZC
zYYjLzhMlSVfjqxdUmXfrVuRC8hfR+klt6GIh4ololijRuzp2+tWWF0CgYEAthbv
9imjLamxVSokto2pYkt3aUwSMrW+R2K2h5a1YJ32HIZfzqakRo4sIea+1kBei/tJ
gmIuAuHocmjIRh5BNChhX5bTcwc6pDnzh3fDB92p/HF85dhkCyCpq7sP9HF0pBIU
hY8dzDLgpMx9+7blMw/E/gU1Ar4d9aGONd65JrMCgYEAl4dDHzThc0IZycH+2cNs
WAvAaJX/EM8TXLb8jlRHrchc6RNZDGHnZR3uAjoQJQ2dShFmwvNC9tRKJBt92D+P
XuMDzNY0yYdrawByyP+bcp6CKO94yX979Kg4P7SwdhAc3jKrJLCgBxyPH1LQ6mOv
MeAbrG4vwzRR7GLFAhpUrhkCgYEAgwCxl1qRaZLCYFE3pJb6nBtLR9hQ52bWBKnC
RH5q853xqMgMObKuUYyLt8A44A/jdbZORp24GJ7LCzTTkY7Gvm2m0IzEh+dViz2e
NYI2MHyLhXFouDwcjdzr9P9aFTVjA392gDhc6cJY2He+08/byga4ZUD9yIFbMJMQ
qzUX4/0CgYEAuthjZqkeAvfc0Eq2UviECNlh/34gT64c+b+x9vDQ9ANAIK1zyonA
mYkHBw7BQqRBCDStQVNhffPcd0TMtDbeoaYZ8XWR8JKDjPPyH59+mQQ59Mg3EJ/4
VlsNflDzpnnSDJXB5hcoTzVeKHk5CmQ1bxDmlS64bnBwNUvJ9ft7Ra4=
-----END RSA PRIVATE KEY-----
`, key.value, 'hex')
  const password = strongCrypter.encrypt('very secure password', key.value, 'hex')

  let cluster = await Cluster.create({
    name: `testing cluster`,
    ssh,
    user: `admin`,
    password,
    authKey,
    authenticationDatabase: `admin`
  }).fetch()

  return cluster
}
