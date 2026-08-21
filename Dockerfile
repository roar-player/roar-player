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

FROM nginx:stable-alpine AS production

COPY --from=build /player/dist /usr/share/nginx/html/

ENV TITLE RoaR Player
ENV DESCRIPTION A pattern-based drumming machine.

# The nginx image's entrypoint runs its init scripts and then execs the CMD, so the title/description
# of the served app can still be customized through the TITLE/DESCRIPTION environment variables
CMD [ "/bin/sh", "-c", "sed -ri /usr/share/nginx/html/index.html -e \"s@<title>[^<]*</title>@<title>$TITLE</title>@\" -e \"s@(<meta name=\\\"description\\\" content=\\\")[^\\\"]*(\\\">)@\\\\1$DESCRIPTION\\\\2@\" && exec nginx -g 'daemon off;'" ]
