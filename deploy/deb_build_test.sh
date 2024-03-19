#!/bin/bash

# Build the package
dpkg-deb --build seabot_qgc

# Build the package start test
docker build -f deb-Dockerfile-ci -t deb_package_test ./