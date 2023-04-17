# Docker commands:
#   docker build . --build-arg api_key=$API_KEY -t craig
#   docker run -it craig
# pull base image
FROM node:alpine as build
WORKDIR /app
COPY . ./
RUN npm install react-scripts sass cdktf cdktf-cli@latest -g
RUN npm run build

FROM node:alpine
WORKDIR /app
# allow for env vars to be passed at build time
ARG api_key=""
ENV API_KEY=$api_key

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/build/ /app/build
COPY --from=build /app/server.js /app/server.js
COPY --from=build /app/lib/ /app/lib
COPY --from=build /app/express-controllers/ /app/express-controllers
COPY --from=build /app/express-routes/ /app/express-routes

# start application
cmd ["npm", "run", "docker-start"]