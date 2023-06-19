# VS Code

![Docker Image Size (tag)](https://img.shields.io/docker/image-size/saagie/vscode-server/3.9.3?label=v3.9.3%20image%20size&style=for-the-badge)

## Description

This directory contains a VsCode server contenairized and customized for Saagie Platform.
See Vscode server official documentation for more information <https://code.visualstudio.com/docs/>.
This image is based on [linuxserver/docker-code-server](https://github.com/linuxserver/docker-code-server).

## How to build in local

```bash
docker build -t saagie/vscode-server .
```

## How to run image in local

```bash
docker run --rm -it -e SAAGIE_BASE_PATH=/ -p 8443:8443 saagie/vscode-server
```

And access it with this adress: [localhost:8443/](localhost:8443/)

## Job/App specific information

You can customize this application with the following parameters:

- "VSCODE_PASSWORD": Password to access the VSCode interface.
- "VSCODE_HASHED_PASSWORD": Same functionality as "VSCODE_PASSWORD", but hashed.
- "VSCODE_SUDO_PASSWORD": Allows to use sudo commands in VSCode terminal.
- "VSCODE_SUDO_PASSWORD_HASH": Same functionality as "VSCODE_SUDO_PASSWORD", but hashed.

To set these variables in your project, see Saagie [documentation](https://docs.saagie.io/user/latest/tutorials/projects-module/projects/envar/index.html#projects-create-envar-global).
