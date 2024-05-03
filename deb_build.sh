#!/bin/bash

# Build the package
#. deploy/docker/build-release.sh

# Set up variables
#QT_INSTALL_DIR="/opt/Qt"
SEABOT_QGC_DIR="./deploy/seabot_qgc"

# Remove old compiled QGC
# Comment this out if not needed
# rm -r deploy/seabot_qgc/opt/Qt

# Copy Qt to the package
#sudo cp -r "$QT_INSTALL_DIR" "$SEABOT_QGC_DIR/opt/"
#sudo chown -R $USER:$USER "$SEABOT_QGC_DIR/opt/Qt"

# Copy QGroundControl binary
pwd
rm -r "$SEABOT_QGC_DIR/usr/bin"
mkdir -p "$SEABOT_QGC_DIR/usr/bin"
cp -r ./seabot_qgc/staging/QGroundControl "$SEABOT_QGC_DIR/usr/bin"

# Copy resources
rm -r ./"$SEABOT_QGC_DIR/usr/share/qgroundcontrol"
mkdir -p ./"$SEABOT_QGC_DIR/usr/share/qgroundcontrol"
cp -r resources/ "$SEABOT_QGC_DIR/usr/share/qgroundcontrol"

# Copy icon
rm -r "$SEABOT_QGC_DIR/usr/share/pixmaps"
mkdir -p "$SEABOT_QGC_DIR/usr/share/pixmaps"
cp -r resources/icons/qgroundcontrol.png "$SEABOT_QGC_DIR/usr/share/pixmaps"

# Copy libraries
#mkdir -p "$SEABOT_QGC_DIR/lib/x86_64-linux-gnu/"
#cp seabot_qgc/libs/shapelib/libshp.so* "$SEABOT_QGC_DIR/lib/x86_64-linux-gnu/"
#cp seabot_qgc/libs/qmlglsink/libqmlglsink.*so "$SEABOT_QGC_DIR/lib/x86_64-linux-gnu/"

# Build Debian package
pwd
cd ./deploy
dpkg-deb --build seabot_qgc
cd ..
pwd
