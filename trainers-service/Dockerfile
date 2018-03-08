FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/trainers-service
WORKDIR /usr/src/trainers-service

# Install app dependencies
COPY package.json /usr/src/trainers-service/
RUN npm install

# Bundle app source
COPY . /usr/src/trainers-service

EXPOSE 8089
CMD [ "npm", "start" ]