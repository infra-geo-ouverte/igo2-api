#!/bin/sh

# Apply migrations before starting the app
if [ "$AUTO_MIGRATE" = "true" ]; then
    echo "Running database migrations..."

    # Set DB_ADMIN_PASSWORD using AWS RDS auth token
    # export DB_ADMIN_PASSWORD=$(node ./scripts/src/aws/generate-token.mjs)

    if ! npx drizzle-kit migrate --config dist/core/database/migration.js; then
        echo "Migration failed! Exiting..."
        exit 1
    fi
    echo "Migrations completed successfully" git ls-tree -r 9cfd13c:docs/
    git checkout 9cfd13c -- ./docs
fi

# Hand off to the CMD
exec "$@"
