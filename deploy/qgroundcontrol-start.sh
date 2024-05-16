#!/bin/sh
export PATH=/opt/Qt/5.15.2/gcc_64/bin/:$PATH
echo $PATH
HERE="$(dirname "$(readlink -f "${0}")")"

# hack until icon issue with AppImage is resolved
mkdir -p ~/.icons && cp "${HERE}/qgroundcontrol.png" ~/.icons

"${HERE}/QGroundControl" "$@"
