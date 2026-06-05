#!/bin/bash

# Start the docker containers, capturing any start errors
echo "🚀 Booting Nova Treasury containers..."
docker compose up -d --build
if [ $? -ne 0 ]; then
    echo "⚠️ Docker compose failed. Please check your Docker status and try again."
    exit 1
fi

# Wait for frontend to respond
echo "⏳ Waiting for Next.js frontend to respond at http://localhost:3000..."
TIMEOUT=30
COUNTER=0
READY=0

if command -v curl >/dev/null 2>&1; then
    while [ $COUNTER -lt $TIMEOUT ]; do
        if curl --output /dev/null --silent --head --fail http://localhost:3000 >/dev/null 2>&1; then
            READY=1
            break
        fi
        printf '.'
        sleep 1
        let COUNTER=COUNTER+1
    done
else
    # Fallback if curl is not installed
    sleep 8
    READY=1
fi

if [ $READY -eq 1 ]; then
    echo " Ready!"
    echo "🌐 Opening dashboard..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000 >/dev/null 2>&1
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:3000 >/dev/null 2>&1
    else
        explorer.exe http://localhost:3000 >/dev/null 2>&1 || start http://localhost:3000 >/dev/null 2>&1
    fi
else
    echo " ⚠️ Timeout waiting for port 3000. Access it at http://localhost:3000"
fi

# Stream docker logs
docker compose logs -f
