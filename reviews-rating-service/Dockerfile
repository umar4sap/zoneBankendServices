FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/publisher_bio_service
WORKDIR /usr/src/publisher_bio_service

# Install app dependencies
COPY package.json /usr/src/publisher_bio_service
RUN npm install

# Bundle app source
COPY . /usr/src/publisher_bio_service

EXPOSE 8088
CMD [ "npm", "start" ]