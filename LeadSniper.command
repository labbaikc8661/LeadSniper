#!/bin/bash
# Lead Sniper - Watch Mode Launcher
# Double-click this file to start the scraper in watch mode.
# It will listen for search requests from the dashboard.

cd "$(dirname "$0")/scraper"

echo ""
echo "  Starting Lead Sniper Watch Mode..."
echo "  Press Ctrl+C to stop."
echo ""

node src/index.js watch --interval 30

# Keep terminal open if it crashes
echo ""
echo "  Watch mode stopped. Press any key to close."
read -n 1
