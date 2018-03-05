FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/training-storage-service
WORKDIR /usr/src/training-storage-service

# Install app dependencies
COPY package.json /usr/src/training-storage-service/
RUN npm install

# Bundle app source
COPY . /usr/src/training-storage-service

EXPOSE 7071
CMD [ "npm", "start" ]