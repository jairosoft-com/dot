FROM node:20
ENV NODE_ENV=development
WORKDIR /home/node/app
COPY . .
RUN yarn install
RUN yarn build
RUN yarn copy-wasm
EXPOSE 5173
RUN chown -R node /home/node/app
USER node
CMD ["yarn", "start"]