# Build
FROM node:24-alpine AS builder

WORKDIR /usr/app

RUN apk update && apk add --no-cache bash curl postgresql-client

COPY package.json package-lock.json .env.example ./
RUN npm ci && \
    npm cache clean --force

COPY tsconfig.json tsconfig.app.json eslint.config.mjs .prettierrc ./
COPY migrations ./migrations
COPY scripts ./scripts/
COPY src ./src/

RUN npm run build

# Example of how to inject source maps to Sentry. You can also upload them as part of your CI/CD pipeline using the sentry-cli or any other method that works for you
# RUN sentry-cli sourcemaps inject /usr/app/dist

# Service
FROM node:24-alpine AS service

WORKDIR /usr/app

RUN apk add --no-cache vim htop tzdata
RUN ln -s /usr/share/zoneinfo/America/Montreal /etc/localtime

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && \
    npm cache clean --force

COPY --from=builder /usr/app/dist ./dist
COPY migrations ./migrations
COPY scripts/src/ ./scripts/src/

# Le regex [v] dans .en[v] rend la présence du fichier facultative
COPY entrypoint.sh .en[v] ./
RUN chmod 755 ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

CMD ["node", "--import", "./dist/monitoring.instrument.js", "./dist/server.js"]

EXPOSE 5020
