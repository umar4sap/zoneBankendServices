FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/zones-branch-management-service
WORKDIR /usr/src/zones-branch-management-service

# Install app dependencies
COPY package.json /usr/src/zones-branch-management-service/
RUN npm install

# Bundle app source
COPY . /usr/src/zones-branch-management-service

EXPOSE 8080
CMD [ "npm", "start" ]