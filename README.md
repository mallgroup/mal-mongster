[![Build Status](https://api.travis-ci.org/mallgroup/mal-mongster.svg?branch=master)](https://travis-ci.org/mallgroup/mal-mongster)

<img src="/admin/src/assets/logo-512x512.png" alt="logo" width="150" height="150" align="right"
 />

# Mongster

Now you can easily connect your nodes with Mongo DB into one cluster within the control panel. Imagine all of the options you get:

-   Control Panel for clusters with simple UI.
-   Replica sets within a few clicks.
-   Adding primary, secondary, or arbiter server as well.
-   Increase/decrease priority, enable/disable voting on the Mongo.
-   Restart Docker container.
-   Create a database, manage users.

We believe that security is essential.

-   So, every password or SSH key is also encrypted.
-   It is entirely up to you where you store application data.

## Prerequisities

You need

-   GIT (to be able to download this repository),
-   TAR (for backups on the node),
-   [Docker](https://www.docker.com/) to run all required images.
-   [Docker Compose](https://docs.docker.com/compose/) to run all containers at once.

## Docker containers with Docker Compose

Create a private network first:

```bash
docker network create -d bridge mal-mongster-tier
```

Run containers with Docker Compose:

```sh
docker-compose down && docker-compose -p mal-mongster up
```

Or on the background:

```sh
docker-compose down && docker-compose -p mal-mongster up -d
```

Admin panel appears on URL <http://localhost:8080>. It might take a minute or two.

### Database

Mongster uses custom MongoDB to store all data. The database data directory is placed in the Docker volume that has been created on startup. So in case, you remove all volumes, you also lose data you stored in this database. So it is highly recommended to mount the data directory somewhere else.

#### Change volumes

In case you remove volumes, you also lose the data you saved earlier. So it might be helpful to map Mongo volume to some other location on your disk.

Open [docker-compose.yml](/docker-compose.yml) file and replace this line:

```yaml
volumes:
  - mongodb_data:/bitnami
```

with content like:

```yaml
volumes:
  - ./my_local_db_folder:/bitnami
```

You can replace the `./my_local_db_folder` with the directory you expect Mongo to store the data.

### Local development

You also might be interested in local development. We'll appreciate any code that makes this product just better.

-   [Local Development](/docs/development.md)

### Testing

-   [Read more about testing](/docs/testing.md)

* * *

## FAQ

We recommend to visit [FAQ page](/FAQ.md).

* * *

## Sponsors

-   [MALL Group](http://www.mallgroup.com)

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

This project is licensed under the **[MIT license](http://opensource.org/licenses/mit-license.php)** - see the [LICENSE.md](/LICENSE.md) file for details.
