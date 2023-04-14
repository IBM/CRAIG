# Docker commands:
#   docker build . --build-arg api_key=$API_KEY -t craig
#   docker run -it craig
# pull base image
FROM node:alpine

# allow for env vars to be passed at build time
ARG api_key=""
ENV API_KEY=$api_key

# set working directory 
WORKDIR /app
COPY client express-controllers express-routes lib server.js ./

RUN npm install react-scripts sass cdktf cdktf-cli@latest -g

# start application
cmd ["npm", "start"]