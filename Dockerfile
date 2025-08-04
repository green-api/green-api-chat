FROM node:16.13-alpine as build

WORKDIR /usr/src/app

ADD . .

ARG DOCKER_TAG

ENV VITE_CAB_VERSION=$DOCKER_TAG

RUN apk update && apk add --no-cache git

RUN cd /usr/src/app && npm ci && npm run build

FROM nginx:1.23.3-alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
ADD .devops/build/conf.nginx /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT sh /entrypoint.sh
