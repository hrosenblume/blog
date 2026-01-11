#!/bin/bash
# Dev tunnel script - starts Next.js with ngrok tunnel
# Forces takeover of existing ngrok endpoints

set -a
source .env.local
set +a

# Generate Prisma client
prisma generate

# Clean .next cache
rm -rf .next

# Kill processes on dev ports
for port in 3000 3001 3002 3003 3004; do
  lsof -ti:$port | xargs kill -9 2>/dev/null
done

# Force-stop any existing ngrok endpoints (allows device switching)
if [ -n "$NGROK_API_KEY" ]; then
  echo "Checking for existing ngrok endpoints..."
  endpoints=$(curl -s -H "Authorization: Bearer $NGROK_API_KEY" -H "Ngrok-Version: 2" https://api.ngrok.com/endpoints)
  if [ -n "$endpoints" ]; then
    session_ids=$(echo "$endpoints" | grep -o '"tunnel_session":{"id":"ts_[^"]*"' | grep -o 'ts_[^"]*')
    for id in $session_ids; do
      echo "Stopping tunnel session: $id"
      curl -s -X POST -H "Authorization: Bearer $NGROK_API_KEY" -H "Ngrok-Version: 2" -H "Content-Type: application/json" -d '{}' "https://api.ngrok.com/tunnel_sessions/$id/stop" >/dev/null
    done
    sleep 2
  fi
fi

# Start Next.js in background (no browser - use tunnel URL)
BROWSER=none AUTH_URL="https://$NGROK_DOMAIN" next dev &
NEXT_PID=$!

# Wait for Next.js to be ready
sleep 3

# Print tunnel URL prominently
echo ""
echo "  ➜  Tunnel:  https://$NGROK_DOMAIN"
echo ""

# Start ngrok tunnel (with or without OAuth based on argument)
if [ "$1" = "--open" ]; then
  npx ngrok http 3000 --domain="$NGROK_DOMAIN" --log=stdout --log-level=warn
else
  npx ngrok http 3000 --domain="$NGROK_DOMAIN" --oauth=google --oauth-allow-email="$NGROK_OAUTH_EMAIL" --oauth-allow-email="$WRITER_EMAIL" --log=stdout --log-level=warn
fi


