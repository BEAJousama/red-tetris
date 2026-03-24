FROM node:24-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY client/package*.json ./client/
RUN cd client && npm i
COPY client ./client
RUN cd client && npm run build

COPY server/package*.json ./server/
RUN cd server && npm i
COPY server ./server
RUN cd server && npm run build

RUN mkdir -p /app/data && chmod 777 /app/data

EXPOSE 3000
CMD ["node", "server/dist/index.js"]