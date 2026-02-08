FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

FROM base AS dev
EXPOSE 4200
CMD ["pnpm", "exec", "ng", "serve", "--configuration", "docker", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]

FROM base AS build

ARG NODE_ENV=production
ARG API_URL=/api
ARG APP_NAME=GetConnect
ENV NODE_ENV=${NODE_ENV}
ENV API_URL=${API_URL}
ENV APP_NAME=${APP_NAME}
RUN pnpm build

FROM nginx:alpine AS prod
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
