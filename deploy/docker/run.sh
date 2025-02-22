
#!/usr/bin/env bash

xhost +
docker run \
    --privileged \
    --rm \
    -it \
    --network=host \
    -e DISPLAY=$DISPLAY \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -v ${PWD}/seabot_qgc:/project/seabot_qgc \
    -v /dev:/dev \
    -v /sys:/sys \
    -v /etc/udev:/etc/udev \
    -v  ~/.config:/home/user/.config \
    qgc-linux-docker \
    /project/seabot_qgc/staging/QGroundControl
