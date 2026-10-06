#!/bin/sh
set -eu
umask 077
directory=/run/sentinel-secrets
mkdir -p "$directory"
if [ ! -f "$directory/database-password" ]; then
  # Kernel CSPRNG; no default or hardcoded database password.
  head -c 32 /dev/urandom | base64 | tr -d '\n' > "$directory/database-password"
fi
# PostgreSQL's startup script runs as root before dropping privileges; the app is uid 1000.
chown -R 1000:1000 "$directory"
chmod 700 "$directory"
chmod 600 "$directory/database-password"
