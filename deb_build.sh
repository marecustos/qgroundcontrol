#!/bin/bash

# Set up variables
SEABOT_QGC_DIR="${{ github.workspace }}/deploy/seabot_qgc"

# Copy QGroundControl binary
pwd
rm -r "$SEABOT_QGC_DIR/usr/bin"
mkdir -p "$SEABOT_QGC_DIR/usr/bin"
cp -r "${{ github.workspace }}/seabot_qgc/staging/QGroundControl" "$SEABOT_QGC_DIR/usr/bin"

# Copy resources
rm -r "$SEABOT_QGC_DIR/usr/share/qgroundcontrol"
mkdir -p "$SEABOT_QGC_DIR/usr/share/qgroundcontrol"
cp -r "${{ github.workspace }}/resources/" "$SEABOT_QGC_DIR/usr/share/qgroundcontrol"

# Copy icon
rm -r "$SEABOT_QGC_DIR/usr/share/pixmaps"
mkdir -p "$SEABOT_QGC_DIR/usr/share/pixmaps"
cp -r "${{ github.workspace }}/resources/icons/qgroundcontrol.png" "$SEABOT_QGC_DIR/usr/share/pixmaps"

# Build Debian package
pwd
cd "${{ github.workspace }}/deploy"
dpkg-deb --build seabot_qgc
cd ..
pwd
