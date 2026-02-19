#!/bin/sh

# Apply migrations before starting the app
if [ "$AUTO_MIGRATE" = "true" ]; then
    echo "Running database migrations..."

    # Example on how we generate an auth token for AWS RDS. You could also use a statcic password or any other secret management solution
    # export DB_ADMIN_PASSWORD=$(node ./scripts/src/aws/generate-token.mjs)

    if ! npx drizzle-kit migrate --config dist/core/database/migration.js; then
        echo "Migration failed! Exiting..."
        exit 1
    fi
    echo "Migrations completed successfully"
fi

# Hand off to the CMD
exec "$@"
