#!/bin/bash
# Validates the setup-droplet.sh script without running it
# Run from the blog directory: ./scripts/test-setup/validate-setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETUP_SCRIPT="$SCRIPT_DIR/../setup-droplet.sh"

echo "🔍 Validating setup-droplet.sh..."
echo ""

# 1. Check syntax
echo "1️⃣  Checking bash syntax..."
if bash -n "$SETUP_SCRIPT"; then
    echo "   ✅ Syntax OK"
else
    echo "   ❌ Syntax errors found"
    exit 1
fi

# 2. Check for required sections
echo ""
echo "2️⃣  Checking required sections..."

required_sections=(
    "SYSTEM UPDATES"
    "INSTALL NODE.JS"
    "INSTALL PM2"
    "INSTALL.*NGINX"
    "SET UP SWAP"
    "CLONE REPOSITORY"
    "INSTALL DEPENDENCIES"
    "ENVIRONMENT VARIABLES"
    "CREATE STARTUP WRAPPER"
    "CREATE PM2 ECOSYSTEM"
    "BUILD APPLICATION"
    "START WITH PM2"
    "LOG ROTATION"
)

for section in "${required_sections[@]}"; do
    if grep -qE "$section" "$SETUP_SCRIPT"; then
        echo "   ✅ Found: $section"
    else
        echo "   ❌ Missing: $section"
        exit 1
    fi
done

# 3. Check that nginx config is created
echo ""
echo "3️⃣  Checking nginx configuration..."
if grep -q "proxy_pass http://localhost:3000" "$SETUP_SCRIPT"; then
    echo "   ✅ Nginx proxy config present"
else
    echo "   ❌ Missing nginx proxy config"
    exit 1
fi

# 4. Check that start.sh wrapper is created
echo ""
echo "4️⃣  Checking start.sh wrapper..."
if grep -q "source .env.local" "$SETUP_SCRIPT"; then
    echo "   ✅ start.sh sources .env.local"
else
    echo "   ❌ start.sh doesn't source .env.local"
    exit 1
fi

# 5. Check environment variable name
echo ""
echo "5️⃣  Checking environment variable names..."
if grep -q "DATABASE_URL_PROD" "$SETUP_SCRIPT"; then
    echo "   ✅ Uses DATABASE_URL_PROD"
else
    echo "   ❌ Missing DATABASE_URL_PROD"
    exit 1
fi

# 6. Check DEBIAN_FRONTEND
echo ""
echo "6️⃣  Checking non-interactive apt..."
if grep -q "DEBIAN_FRONTEND=noninteractive" "$SETUP_SCRIPT"; then
    echo "   ✅ Non-interactive apt configured"
else
    echo "   ❌ Missing DEBIAN_FRONTEND=noninteractive"
    exit 1
fi

# 7. Check ecosystem config uses wrapper
echo ""
echo "7️⃣  Checking PM2 ecosystem config..."
if grep -q "script.*start.sh" "$SETUP_SCRIPT"; then
    echo "   ✅ Uses start.sh wrapper"
else
    echo "   ❌ Ecosystem config doesn't use start.sh"
    exit 1
fi

if grep -q "interpreter.*bash" "$SETUP_SCRIPT"; then
    echo "   ✅ Uses bash interpreter"
else
    echo "   ❌ Missing bash interpreter"
    exit 1
fi

# 8. Check repo files match
echo ""
echo "8️⃣  Checking repo files consistency..."

REPO_ROOT="$SCRIPT_DIR/../.."

# Check ecosystem.config.js exists and uses start.sh
if grep -q "script.*start.sh" "$REPO_ROOT/ecosystem.config.js"; then
    echo "   ✅ ecosystem.config.js uses start.sh"
else
    echo "   ❌ ecosystem.config.js doesn't use start.sh"
    exit 1
fi

# Check start.sh exists
if [ -f "$REPO_ROOT/start.sh" ]; then
    echo "   ✅ start.sh exists in repo"
else
    echo "   ❌ start.sh missing from repo"
    exit 1
fi

# Check deploy.yml has chmod +x start.sh
if grep -q "chmod +x start.sh" "$REPO_ROOT/.github/workflows/deploy.yml"; then
    echo "   ✅ deploy.yml makes start.sh executable"
else
    echo "   ❌ deploy.yml missing chmod +x start.sh"
    exit 1
fi

echo ""
echo "============================================================"
echo "✅ All validations passed!"
echo "============================================================"
echo ""
echo "To test in Docker (optional):"
echo "  docker run -it --rm ubuntu:22.04 bash"
echo "  # Then paste sections of the script to test"
echo ""
