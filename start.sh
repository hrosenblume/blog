#!/bin/bash
# Startup wrapper script for PM2
# Loads environment variables from .env.local before starting Next.js
# Note: PM2's cwd config sets the directory, so no cd needed here

set -a
source .env.local
set +a
exec npm start
