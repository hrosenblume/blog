#!/bin/bash
# Startup wrapper script for PM2
# Loads environment variables from .env.local before starting Next.js

cd /var/www/blog
set -a
source .env.local
set +a
exec npm start
