


docker build --file ./deploy/docker/Dockerfile-build-linux-release -t qgc-linux-docker .
mkdir  "$(pwd)"/seabot_qgc
docker run --rm -v ${PWD}:/project/source -v ${PWD}/seabot_qgc:/project/seabot_qgc qgc-linux-docker
