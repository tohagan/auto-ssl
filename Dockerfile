FROM node:4.4.5
MAINTAINER Tony OHagan <tony@ohagan.name>

ENV APPDIR /usr/src/app

RUN mkdir -p $APPDIR
WORKDIR $APPDIR

# Install APPDIR dependencies
COPY package.json $APPDIR

ENV NODE_ENV production
RUN npm -q install

COPY . $APPDIR
RUN chown -R nobody:nogroup $APPDIR && chmod -R a-w $APPDIR && ls -ld

# Certs
RUN mkdir -p /etc/certs/prod /etc/certs/staging
VOLUME /etc/certs

USER nobody

# Ports > 1024 since we're not root.
EXPOSE 8080 8443 5001

ENTRYPOINT ["node"]
CMD ["./server.js"]
