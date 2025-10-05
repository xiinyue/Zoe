FROM quay.io/xirtexe/zoe-xd:latest
USER node
WORKDIR /home/node/Zoe-xd
RUN git clone https://github.com/Xirtexe/Zoe .
RUN yarn install --network-concurrency 1
CMD ["yarn", "start"]
