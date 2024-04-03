#!/bin/bash

# Build the package
. deploy/docker/build-release.sh
#remove old compiled qgc

rm -r deploy/seabot_qgc/usr/bin
mkdir -p deploy/seabot_qgc/usr/bin
cp -r seabot_qgc/QGroundControl deploy/seabot_qgc/usr/bin

rm -r deploy/seabot_qgc/usr/share/qgroundcontrol
mkdir -p deploy/seabot_qgc/usr/share/qgroundcontrol
cp -r resources/ deploy/seabot_qgc/usr/share/qgroundcontrol

rm -r deploy/seabot_qgc/usr/share/pixmaps
mkdir -p deploy/seabot_qgc/usr/share/pixmaps
cp -r resources/icons/qgroundcontrol.png deploy/seabot_qgc/usr/share/pixmaps

rm -r deploy/seabot_qgc/lib/
mkdir -p deploy/seabot_qgc/lib/x86_64-linux-gnu/
cp  seabot_qgc/libs/shapelib/libshp.so* deploy/seabot_qgc/lib/x86_64-linux-gnu/

mkdir -p deploy/seabot_qgc/lib/x86_64-linux-gnu/
cp  seabot_qgc/libs/qmlglsink/libqmlglsink.*so deploy/seabot_qgc/lib/x86_64-linux-gnu/

cd  deploy
dpkg-deb --build seabot_qgc
cd ..