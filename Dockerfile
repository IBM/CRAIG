# Docker commands:
#   docker build . --build-arg api_key=$API_KEY -t craig
#   docker run -it craig
# pull base image
FROM node as build
WORKDIR /app
COPY . ./
RUN npm install react-scripts sass cdktf cdktf-cli@latest -g
RUN npm run build

FROM node
WORKDIR /app
ENV NODE_ENV production
COPY package.json .
COPY package-lock.json .
COPY --from=build /app/client/ /app/client
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/build/ /app/build
COPY --from=build /app/server.js /app/server.js
COPY --from=build /app/lib/ /app/lib
COPY --from=build /app/express-controllers/ /app/express-controllers
COPY --from=build /app/express-routes/ /app/express-routes
RUN ["npm",  "ci", "--omit", "dev"]
# start application
CMD ["node", "server.js"]