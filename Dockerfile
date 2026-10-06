FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run check && npm run build && npm prune --omit=dev --ignore-scripts

FROM node:24-bookworm-slim
ENV NODE_ENV=production BIND_HOST=0.0.0.0 PORT=8080 STATIC_DIR=/app/build/web SECRET_DIR=/run/sentinel-secrets DB_PASSWORD_FILE=/run/sentinel-secrets/database-password
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/db ./db
COPY --from=build --chown=node:node /app/scripts/show-invitation.mjs ./scripts/show-invitation.mjs
COPY --from=build --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","build/api/main.js"]
