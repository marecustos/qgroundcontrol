#!/bin/bash

# Set up variables


# Copy QGroundControl binary
pwd
rm -r "${{ github.workspace }}/deploy/seabot_qgc/usr/bin"
mkdir -p "${{ github.workspace }}/deploy/seabot_qgc/usr/bin"
cp -r "${{ github.workspace }}/seabot_qgc/staging/QGroundControl" "${{ github.workspace }}/deploy/seabot_qgc/usr/bin"

# Copy resources
rm -r "${{ github.workspace }}/deploy/seabot_qgc/usr/share/qgroundcontrol"
mkdir -p "${{ github.workspace }}/deploy/seabot_qgc/usr/share/qgroundcontrol"
cp -r "${{ github.workspace }}/resources/" "${{ github.workspace }}/deploy/seabot_qgc/usr/share/qgroundcontrol"

# Copy icon
rm -r "${{ github.workspace }}/deploy/seabot_qgc/usr/share/pixmaps"
mkdir -p "${{ github.workspace }}/deploy/seabot_qgc/usr/share/pixmaps"
cp -r "${{ github.workspace }}/resources/icons/qgroundcontrol.png" "${{ github.workspace }}/deploy/seabot_qgc/usr/share/pixmaps"

# Build Debian package
pwd
cd "${{ github.workspace }}/deploy"
dpkg-deb --build seabot_qgc
cd ..
pwd
