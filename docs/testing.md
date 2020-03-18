# Testing - API

You can run Docker container (Mongo DB and API) to run unit tests again the API:

```bash
docker-compose down && docker-compose -f docker-compose-test.yml up
```

When the test finishes, you should press CTRL+C (Command+C) to shutdown running containers.

# Testing - Admin Panel

There are no tests for admin panel yet.
