FROM postgres:16.4-bullseye

# PostGIS 주 버전 설정
ENV POSTGIS_MAJOR=3
ENV POSTGIS_VERSION=3.4.2+dfsg-1.pgdg110+1

# 필요한 패키지 설치 및 PostGIS 설치
# 인증서 오류 발생할 경우 ca-certificates 패키지 설치
RUN apt-get update \
      && apt-cache showpkg postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR \
      && apt-get install -y --no-install-recommends \
           postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR=$POSTGIS_VERSION \
           postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts \
      && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /docker-entrypoint-initdb.d
# PostGIS 초기화 스크립트 추가
COPY ./initdb-postgis.sh /docker-entrypoint-initdb.d/10_postgis.sh
# PostGIS 업데이트 스크립트 추가
COPY ./update-postgis.sh /usr/local/bin

RUN chmod +x /docker-entrypoint-initdb.d/10_postgis.sh

ENV POSTGRES_DB=gis
