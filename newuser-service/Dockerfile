FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/zones-newuser-service
WORKDIR /usr/src/zones-newuser-service

# Install app dependencies
COPY package.json /usr/src/zones-newuser-service/
RUN npm install

# Bundle app source
COPY . /usr/src/zones-newuser-service

EXPOSE 7071
CMD [ "npm", "start" ]