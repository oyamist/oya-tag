FROM ubuntu:18.04
LABEL maintainer="karl@oyamist.com"
 
# Update the image to the latest packages
# NOTE: apt-util warning is expected. Ignore it
RUN apt-get update && apt-get upgrade -y
RUN apt-get install sudo -y
RUN apt-get install busybox -y
RUN ln -s /bin/busybox /bin/vi

# Add unroot user
RUN echo "unroot\tALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
RUN useradd unroot -s /bin/bash -m 
RUN usermod -aG sudo unroot

CMD [ "bash", "-c", "su unroot" ]
