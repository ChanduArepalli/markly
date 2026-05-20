FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

# Install deps (cached layer)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

# Next.js needs these at BUILD TIME to bake them into the JS
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY

RUN pnpm build
CMD ["pnpm", "start"]