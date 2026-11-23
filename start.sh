#!/bin/sh
# Sharpy's MCP server over stdio.
# With Sharpy for Mac installed this becomes the app's own helper. `exec` matters: Sharpy asks for
# permission per calling program, so the helper has to stay a direct child of the AI tool.
HELPER=/Applications/Sharpy.app/Contents/Helpers/sharpy-mcp
[ -x "$HELPER" ] && exec "$HELPER" "$@"
exec node "$(dirname "$0")/server.mjs"
