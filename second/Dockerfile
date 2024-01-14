FROM node:18
WORKDIR /apps
COPY package.json /apps
RUN npm install
COPY . /apps
EXPOSE 3001
CMD [ "npm", "start" ]