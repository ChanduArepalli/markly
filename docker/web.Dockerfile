FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

# Install deps (cached layer)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
