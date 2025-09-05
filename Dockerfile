# Use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install dependencies into temp directory for caching
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install all dependencies for production (SSR needs some dev deps)
RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

# Build stage
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Set environment and build the application
ENV NODE_ENV=production
RUN bun run build

# Production stage
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/.output ./.output
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/public ./public

# Copy node_modules to the server output directory where it's expected
RUN cp -r node_modules .output/server/ || echo "Failed to copy node_modules to server directory"

# Verify react-dom is properly installed and accessible in both locations
RUN test -f node_modules/react-dom/package.json || (echo "react-dom not found in root" && exit 1)
RUN test -f .output/server/node_modules/react-dom/package.json || (echo "react-dom not found in server" && exit 1)

# Set up the runtime environment
USER bun
EXPOSE 3000/tcp
ENV NODE_ENV=production
ENV PORT=3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application using bun run start
CMD ["bun", "run", "start"]
