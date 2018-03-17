FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/plans-service
WORKDIR /usr/src/plans-service

# Install app dependencies
COPY package.json /usr/src/plans-service/
RUN npm install

# Bundle app source
COPY . /usr/src/plans-service

EXPOSE 8089
CMD [ "npm", "start" ]