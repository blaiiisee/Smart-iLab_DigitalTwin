FROM node:alpine

WORKDIR /DT

COPY package*.json ./

RUN npm install
RUN npm install -g vite

COPY . .

EXPOSE 5500

CMD [ "npm", "run", "dev" ]
