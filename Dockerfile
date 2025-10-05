FROM quay.io/xirtexe/zoe-xd:latest
RUN git clone https://github.com/Xirtexe/Zoe /root/Zoe-xd/
WORKDIR /root/Zoe-xd/
RUN yarn install --network-concurrency 1
CMD ["npm", "start"]
