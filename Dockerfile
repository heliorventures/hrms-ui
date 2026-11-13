# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && npm run security:audit

COPY tsconfig.json tsconfig.build.json tsconfig.node.json vite.config.ts ./
COPY postcss.config.js tailwind.config.js index.html ./
COPY public ./public
COPY src ./src

ARG VITE_ORGANIZATION_ENABLED=false
ENV VITE_ORGANIZATION_ENABLED=${VITE_ORGANIZATION_ENABLED}
RUN case "$VITE_ORGANIZATION_ENABLED" in true|false) ;; *) exit 1 ;; esac
RUN npm run build

FROM nginx:1.27-alpine AS runtime

ARG VITE_ORGANIZATION_ENABLED=false
LABEL io.kabipay.ui.organization-workspace=${VITE_ORGANIZATION_ENABLED}

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
