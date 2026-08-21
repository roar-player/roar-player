FROM node:lts-alpine AS build

# chromium + ttf-dejavu + font-noto-emoji are used to generate the PDF tune sheets (the browser that
# Puppeteer would download itself does not run on Alpine/musl); git is used to determine the per-tune
# sheet versions from the repository history (the .git directory must be part of the build context,
# with the full history — a shallow clone yields no per-tune versions)
RUN apk add --update-cache git chromium ttf-dejavu font-noto-emoji && \
    git config --global --add safe.directory /player

ENV PUPPETEER_SKIP_DOWNLOAD=1
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /player
COPY ./ ./

RUN yarn install && yarn build && yarn build-sheets

FROM httpd:2.4-alpine AS production

RUN echo "AddType text/cache-manifest .manifest" >> /usr/local/apache2/conf/httpd.conf && \
    apk --no-cache add dumb-init

COPY --from=build /player/dist /usr/local/apache2/htdocs/

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

ENV TITLE RoR Player
ENV DESCRIPTION A pattern-based drumming machine.

CMD [ "/bin/sh", "-c", "sed -ri /usr/local/apache2/htdocs/index.html -e \"s@<title>[^<]*</title>@<title>$TITLE</title>@\" -e \"s@(<meta name=\\\"description\\\" content=\\\")[^\\\"]*(\\\">)@\\\\1$DESCRIPTION\\\\2@\" && httpd-foreground" ]
