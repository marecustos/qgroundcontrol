


docker build --file ./deploy/docker/Dockerfile-build-linux -t qgc-linux-docker .
mkdir  "$(pwd)"/build
 chown -R $USER:$USER "$(pwd)"/build
docker run --rm -v ${PWD}:/project/source -v ${PWD}/build:/project/build qgc-linux-docker
