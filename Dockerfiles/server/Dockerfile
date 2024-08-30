FROM node:20-alpine AS builder

WORKDIR /usr/app

COPY . .

RUN npm i && npm run build && npm prune --production


FROM node:20-alpine

WORKDIR /usr/app

# 실행에 필요한 파일인 dist, node_modules 만 copy
COPY --from=builder /usr/app/dist ./dist

COPY --from=builder /usr/app/node_modules ./node_modules

ENTRYPOINT ["node", "/usr/app/dist/main"]
