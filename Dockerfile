FROM node:11

# Create app directory
WORKDIR /usr/src/app


# Bundle app source
COPY . ./

# Install app dependencies
RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
