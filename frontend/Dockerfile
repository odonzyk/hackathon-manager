# --- Build Stage ---
FROM node:20 AS builder

WORKDIR /app
COPY ./package*.json ./
RUN npm install

COPY . .
RUN find /app  # Debug: zeigt alle Dateien im Container
RUN npm run build
RUN ls -la /app/dist || true

# --- Production Stage ---
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
