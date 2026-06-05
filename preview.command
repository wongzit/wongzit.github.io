#!/bin/bash
# ============================================================================
# Double-click this file to preview the whole site (including the blog) on your
# own computer. It starts a tiny local web server and opens your browser.
# When you're done, close this Terminal window or press Control-C.
# ============================================================================
cd "$(dirname "$0")"
PORT=8000
echo ""
echo "  Starting local preview of your website..."
echo "  Opening:  http://localhost:$PORT"
echo ""
echo "  Keep this window open while you browse. Close it (or press Ctrl-C) to stop."
echo ""
# open the browser a moment after the server starts
( sleep 1; open "http://localhost:$PORT" ) &
# python3 ships with macOS
python3 -m http.server $PORT
