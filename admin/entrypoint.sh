#!/bin/sh

set -uo pipefail

rm -f ./.quasar.env.json
touch ./.quasar.env.json

APP_URL=

echo '{"production":{"APP_URL":"'$APP_URL'"}}' >> ./.quasar.env.json

npm run build

exec yarn production
