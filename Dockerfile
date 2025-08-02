FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server.js ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

USER nodejs

EXPOSE 3001

CMD ["node", "server.js"]