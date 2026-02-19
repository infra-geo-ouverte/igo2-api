#!/bin/sh

# This script is used to publish the source maps to Sentry.
# It need to be executed in the context of CI/CD pipeline and inside de Docker builder image.

set -e

# Setup configuration values
SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
SENTRY_ORG=YOUR_ORGANIZATION
SENTRY_PROJECT=igo-api
VERSION="${VERSION}"

sentry-cli releases --org $SENTRY_ORG --project $SENTRY_PROJECT new "$VERSION"
sentry-cli releases --org $SENTRY_ORG --project $SENTRY_PROJECT finalize "$VERSION"
sentry-cli sourcemaps upload --org $SENTRY_ORG --project $SENTRY_PROJECT --release $VERSION /usr/app/dist

if [ -n "$VERSION" ]; then
  sentry-cli deploys --org $SENTRY_ORG --project $SENTRY_PROJECT new --release $VERSION -e $ENVIRONMENT
fi
