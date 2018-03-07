FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/provision-service
WORKDIR /usr/src/provision-service

# Install app dependencies
COPY package.json /usr/src/provision-service/
RUN npm install

# Bundle app source
COPY . /usr/src/provision-service

EXPOSE 8089
CMD [ "npm", "start" ]