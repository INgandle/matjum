#!/bin/sh
set -e

# Perform all actions as $POSTGRES_USER
export PGUSER="$POSTGRES_USER"

# PostGIS 버전 설정
POSTGIS_VERSION="${POSTGIS_VERSION%%+*}"

# $POSTGRES_DB에 PostGIS 설치, 업데이트
echo "Installing PostGIS extension to $POSTGRES_DB"
psql --dbname="$POSTGRES_DB" -c "
    -- Install PostGIS (includes raster)
    CREATE EXTENSION IF NOT EXISTS postgis VERSION '$POSTGIS_VERSION';
    ALTER EXTENSION postgis UPDATE TO '$POSTGIS_VERSION';
"
