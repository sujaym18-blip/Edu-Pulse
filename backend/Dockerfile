
FROM node:16
WORKDIR /app
COPY backend/package*.json ./

RUN npm install
COPY backend/ .

EXPOSE 7000

CMD ["npm", "start"]
