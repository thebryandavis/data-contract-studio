FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
CMD ["sh", "-c", "caddy file-server --root /srv --listen :${PORT:-8080}"]
