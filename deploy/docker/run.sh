
#!/usr/bin/env bash

xhost +
docker run \
    --rm \
    -it \
    --privileged \
    --network host \
    -e DISPLAY=$DISPLAY \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -v ${PWD}/build:/project/build \
    -v /dev:/dev \
    -v /sys:/sys \
    -v /etc/udev:/etc/udev \
    -v  ~/.config:/home/user/.config \
    qgc-linux-docker \
    /project/build/QGroundControl 
