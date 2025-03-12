FROM httpd:2.4

WORKDIR /DT

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5500
