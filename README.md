# 맛점: 위치 기반 맛집 추천 서비스

위치 기반 추천 기능으로 맛집을 찾아 맛있는 점심식사도 하고 평점도 매겨보세요.

# 실행 방법

## 사전 준비

- `.env.sample` 을 참고하여 `.env` 파일을 생성합니다.
- (개발환경) docker desktop이 설치되어 있어야 합니다.

## development 실행

- `npm install` 명령어로 의존성 패키지를 설치합니다.
- `npm run docker:dev` 명령어로 데이터베이스 docker container 를 실행합니다.
  - `.env`파일의 `POSTGRES_*` 값을 읽어 database, user가 생성되니 따로 생성 안하셔도 됩니다.
  - `docker compose up -f docker-compose.dev.yml` 으로 대체가능.
- `npm run start` 명령어로 서버를 실행합니다.

## production 실행

- `npm run docker:prod` 명령어로 데이터베이스 docker container 를 실행합니다.
  - `docker-compose up` 으로 대체가능.

## 정상 실행 확인

- `docker ps` 로 실행된 컨테이너들을 확인할 수 있습니다.

  - `development` 환경의 경우 postgres 이미지를 사용한 `matjum_db` 컨테이너가 실행 됩니다.
  - `production` 환경의 경우 추가로 `matjum_server` 컨테이너가 실행 됩니다.

  출력 예시

  ```shell
  ➜ matjum (main) ✗ docker ps
    CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS                   PORTS                    NAMES
    3144d05113d8   matjum-server          "node /usr/app/dist/…"   2 minutes ago    Up 2 minutes             0.0.0.0:3000->3000/tcp   matjum_server
    8f1618da98c1   postgres:16.4-alpine   "docker-entrypoint.s…"   25 minutes ago   Up 2 minutes (healthy)   0.0.0.0:5432->5432/tcp   matjum_db
  ```

## 실행 중인 컨테이너에 접속

- `docker exec -it <container_id> /bin/sh` 명령어로 실행 중인 컨테이너에 접속할 수 있습니다.
  - `/bin/sh` 대신 원하는 명령어를 입력할 수 있습니다.
  - `container_id`는 `docker ps` 명령어로 확인할 수 있습니다.
  - 식별자는 일부만 입력해도 됩니다. (예: `docker exec -it 31 /bin/sh`)

## 호스트에서 psql로 container 내의 db 접속도 가능합니다.

- `psql` 명령어가 없는 경우 libpq 패키지를 설치해주세요.
  - `brew install libpq`
  - `export PATH="/usr/local/opt/libpq/bin:$PATH"` (필요한 경우)
- 접속은 `psql -h localhost -U <username> -d <database> -p <port>` 명령어로 가능합니다.
  - `username`과 `database`, `port`는 `.env` 파일의 `POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PORT` 값과 동일해야 합니다.

## 컨테이너 종료

- `npm run docker:dev:stop` 혹은 `npm run docker:prod:stop` 명령어로 컨테이너를 종료할 수 있습니다.
- `docker stop` 이나 `docker compose down -f <파일명>` 명령어로도 종료할 수 있습니다.

## docker volume 삭제해야 할 때 (DB 테이블 변경 등)

- database 다 날아가니 주의해서 사용해주세요.
- `docker volume rm matjum_db_data` 명령어로 삭제합니다.
