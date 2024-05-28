#!/bin/bash

# Capture window IDs before launching the application
WINDOW_IDS_BEFORE=$(wmctrl -l | awk '{print $1}')

# Launch the oculus-viewpoint application

oculus-viewpoint &

# Wait for the application to start

sleep 0.5

# Capture window IDs after launching the application

WINDOW_IDS_AFTER=$(wmctrl -l | awk '{print $1}')

# Find the new window ID
NEW_WINDOW_ID=$(comm -13 <(echo "$WINDOW_IDS_BEFORE" | sort) <(echo "$WINDOW_IDS_AFTER" | sort))

if [ -z "$NEW_WINDOW_ID" ]; then
  echo "Failed to find the window ID."
  exit 1
fi

WINDOW_INFO=$(xwininfo -id $NEW_WINDOW_ID)


echo "$NEW_WINDOW_ID"


