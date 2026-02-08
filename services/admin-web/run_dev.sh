#!/bin/bash
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
fi

npm run dev
