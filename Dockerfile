FROM httpd:2.4-alpine

RUN echo "AddType text/cache-manifest .manifest" >> /usr/local/apache2/conf/httpd.conf

RUN apk --no-cache update && apk --no-cache add git nodejs yarn dumb-init chromium ttf-dejavu

RUN adduser -D -h /opt/ror-player -s /bin/sh beatbox
USER beatbox
WORKDIR /opt/ror-player/

COPY --chown=beatbox ./ ./

# The PDF tune sheets are rendered with the system Chromium instead of the browser downloaded by Puppeteer,
# which does not run on Alpine (musl)
ENV PUPPETEER_SKIP_DOWNLOAD=1
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN yarn install && yarn build && yarn build-sheets && rm -rf node_modules

USER root
RUN mv dist/* /usr/local/apache2/htdocs/

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

ENV TITLE RoR Player
ENV DESCRIPTION A pattern-based drumming machine.

CMD [ "/bin/sh", "-c", "sed -ri /usr/local/apache2/htdocs/index.html -e \"s@<title>[^<]*</title>@<title>$TITLE</title>@\" -e \"s@(<meta name=\\\"description\\\" content=\\\")[^\\\"]*(\\\">)@\\\\1$DESCRIPTION\\\\2@\" && httpd-foreground" ]
