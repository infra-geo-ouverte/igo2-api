/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    { name: 'prod' },
    { name: 'acc', prerelease: 'rc' },
    { name: 'dev', prerelease: 'next' }
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/github',
    // NPM is only use to update the package.json
    [
      '@semantic-release/npm',
      {
        npmPublish: false
      }
    ],
    [
      '@semantic-release/exec',
      {
        verifyReleaseCmd: 'echo RELEASE=${nextRelease.version} > .env',
        publishCmd: [
          // Sentry script
          // `docker run --rm \
          //   -e SENTRY_AUTH_TOKEN=${env.SENTRY_AUTH_TOKEN} \
          //   -e VERSION=\${nextRelease.version} \
          //   -e ENVIRONMENT=${env.ENVIRONMENT} \
          //   ${env.IMAGE_NAME}-builder \
          //   /bin/sh -c ./scripts/src/monitoring/sentry-release.sh`
        ].join(' && ')
      }
    ],
    [
      '@semantic-release/git',
      { assets: ['src/**/*', 'package.json', 'package-lock.json'] }
    ]
  ]
};
