FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/zone-service
WORKDIR /usr/src/zone-service

# Install app dependencies
COPY package.json /usr/src/zone-service
RUN npm install

# Bundle app source
COPY . /usr/src/zone-service

EXPOSE 8088
CMD [ "npm", "start" ]
