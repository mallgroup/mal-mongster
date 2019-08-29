# FAQ

You can always:

-   raise a [new issue](https://github.com/danielrataj/mal-mongster/issues) or
-   consider to implement some change on your own and then create a [pull request](https://github.com/danielrataj/mal-mongster/pulls).

We appreciate both options.

#### General knowledge

Please consider to learn more about [MongoDB](https://www.mongodb.org/). It is always better to know more about what's going on under the hood.

## General

#### `What version of Mongo is supported?`

All Docker containers start MongoDB version 4.0.12

#### `The UI seems to be slower when I make some change`

That might happen from various reasons. Communication between all servers might take some time.

#### `Can I use IP address instead of domain (FQDN)?`

It is not recommended. IP address might change, FQDN rarely. Also Mongster does not work well with IP address. Please take some time to configure your hostname and DNS. You might find it useful in future.

## Security

#### `I can read my SSH private key. It is not considered to be a bad practice?`

Well, you can see it encrypted in the panel but it is completely decrypted in database. The same goes for passwords or any sensitive kind of information.

#### `Can I run multiple instances of Mongo on the same node?`

You can run only 1 instance of Mongo on port 27017. It might look a bit greedy but it has good reasons in regards to cluster stability.

## Replica Set

#### `Does Mongster use some authentication between replicas?`

Yes. We're using internal one via [key file](https://docs.mongodb.com/manual/reference/configuration-options/#security.keyFile). It is generated automatically when you add a new cluster. Auth file is stored in `/data` directory on the node.

#### `Where is my data directory on replica nodes?`

All data are stored in `/data` directory.

#### `How many members can I have in my replica set?`

There are some Mongo limits. You can have up to 50 nodes but [only 7 voting members](https://docs.mongodb.com/manual/reference/limits/#Number-of-Voting-Members-of-a-Replica-Set).

#### `Do I need an arbiter node?`

Arbiter does not need any extra performance. However it has to be running on separate node.
In case your cluster is about to fall apart he might break election ties in a situation where there is an even number (2, 4, 6...) of MongoDB nodes.

## Other

#### `Do you support sharded cluster?`

Currently Mongster does not support any kind of configuration for [sharded cluster](https://docs.mongodb.com/manual/sharding/).
