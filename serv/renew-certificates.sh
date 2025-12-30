#!/bin/bash

# Script to renew SSL certificates for FITDESK domains
# This script uses docker compose and certbot to renew certificates

# Prevent the script from exiting on error, handle errors manually
set +e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Trap Ctrl+C (INT) and exit
trap "echo -e '${RED}Script interrupted by user.${NC}'; exit 1" INT

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Assumes script is in the same folder as docker-compose.prod.yml
# If script is in a subfolder (like ./scripts/), uncomment the line below:
# cd "$SCRIPT_DIR/.." || exit
cd "$SCRIPT_DIR"

echo -e "${GREEN}=== SSL Certificate Renewal Script (Fitdesk) ===${NC}"
echo -e "${YELLOW}Working directory: $(pwd)${NC}"
echo -e "${YELLOW}Using compose file: docker-compose.prod.yml${NC}"
echo ""

# List of all fitdesk domains to renew
DOMAINS=(
    "api.fitdesk.happykiller.net"
    "bo.fitdesk.happykiller.net"
    "fo.fitdesk.happykiller.net"
    "mobile.fitdesk.happykiller.net"
    "mongo.fitdesk.happykiller.net"
    "showcase.fitdesk.happykiller.net"
)

# Counter for success/failure
SUCCESS_COUNT=0
FAILURE_COUNT=0
FAILED_DOMAINS=()
TOTAL_DOMAINS=${#DOMAINS[@]}
CURRENT=0

echo -e "${GREEN}Starting certificate renewal for $TOTAL_DOMAINS domains...${NC}"
echo ""

# Loop through each domain and renew certificate
for DOMAIN in "${DOMAINS[@]}"; do
    ((CURRENT++))
    echo -e "${BLUE}[$CURRENT/$TOTAL_DOMAINS]${NC} ${YELLOW}Processing: $DOMAIN${NC}"
    
    # We use -T to disable TTY allocation which causes "input device is not a TTY" errors
    # Added -f docker-compose.prod.yml specifically for your setup
    docker compose -f docker-compose.prod.yml run --rm -T certbot certonly \
        --webroot \
        --webroot-path /var/www/certbot/ \
        -d "$DOMAIN" \
        --expand \
        --non-interactive \
        --agree-tos \
        --email admin@happykiller.net < /dev/null
    
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully renewed certificate for $DOMAIN${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}✗ Failed to renew certificate for $DOMAIN (Exit code: $EXIT_CODE)${NC}"
        ((FAILURE_COUNT++))
        FAILED_DOMAINS+=("$DOMAIN")
    fi
    
    echo "---------------------------------------------------"
    echo ""
done

# Print summary
echo -e "${GREEN}=== Renewal Summary ===${NC}"
echo -e "Total domains: $TOTAL_DOMAINS"
echo -e "${GREEN}Successful: $SUCCESS_COUNT${NC}"
echo -e "${RED}Failed: $FAILURE_COUNT${NC}"

if [ $FAILURE_COUNT -gt 0 ]; then
    echo ""
    echo -e "${RED}Failed domains:${NC}"
    for FAILED_DOMAIN in "${FAILED_DOMAINS[@]}"; do
        echo -e "  - $FAILED_DOMAIN"
    done
fi

echo ""
echo -e "${YELLOW}Reloading Nginx to apply changes...${NC}"
# Adjusted to match your service name "nginx" and config file
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Nginx reloaded successfully.${NC}"
else
    echo -e "${RED}Failed to reload Nginx.${NC}"
fi
echo ""

exit $FAILURE_COUNT