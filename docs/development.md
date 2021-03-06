# Local development

There are two different folders:

-   `api` that holds files for API and
-   `admin` that holds files for the administration panel.

### api

Is written in [SailsJS](https://sailsjs.com) framework.

### admin

Is written in [QuasarJS](https://quasar.dev) framework.

## Docker Compose setup

You need [Docker Compose](https://docs.docker.com/compose/) installed on the machine.
You should run the following command to run a completely Docker-based local environment ready for development.

```sh
docker-compose down && docker-compose -f docker-compose-dev.yml up
```

That is what you get:

-   Admin panel will be available on URL <http://localhost:8080>
-   API is running on URL <http://localhost:1337>
-   MongoDB is running on default port 27017.
-   And hot reloading during both API and admin panel development.

### First boot

It might be slower due to your station configuration. Also running the `hot reload` feature within a Docker container can be pretty exhaustive.

## Docker volumes

Mongo DB container has a custom volume that creates itself during startup. You can see all volumes with this command:

```sh
docker volume ls
```

You can also remove all unused volumes with:

```sh
docker volume prune -f
```

**Note:** If you delete the volume, you lose data about the cluster or nodes you previously created. So it might be useful to map your volumes to some other place.

It should all ends with the screen as follows:

![Hot Reload](/docs/images/final-screen.png "Screen")

Screen from Quasar CLI that indicates that app running on port 8080. You might ignore the red warning line.

### Change volumes

In case you remove volumes, you also lose the data you saved earlier. So it might be useful to map Mongo volume to some other location on your disk.

Open [docker-compose-dev.yml](/docker-compose-dev.yml) file and replace this line:

```yaml
volumes:
  - mongodb_data:/bitnami
```

with content like:

```yaml
volumes:
  - ./my_local_db_folder:/bitnami
```

You can replace the `./my_local_db_folder` with the directory you expect the Mongo will store the data.

## Admin - Generate favicons

Run in /admin directory (don't forget to install icongenie package globally first):

```sh
icongenie generate -i public/logo/logo-512x512.png --skip-trim -m spa
```
