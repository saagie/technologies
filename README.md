# Saagie Technologies


[![GitHub release](https://img.shields.io/github/release/saagie/technologies?style=for-the-badge)][releases] 
[![GitHub release date](https://img.shields.io/github/release-date/saagie/technologies?style=for-the-badge&color=blue)][releases]  

[![Build Promote](https://img.shields.io/github/workflow/status/saagie/technologies/PROMOTE?label=LATEST%20PROMOTE&style=for-the-badge)][build_promote] [![Build modify](https://img.shields.io/github/workflow/status/saagie/technologies/BUILD%20ONLY%20MODIFIED?label=LATEST%20BRANCH%20BUILD&style=for-the-badge)][build_modified]

[![Issues](https://img.shields.io/github/issues-raw/saagie/technologies?style=for-the-badge&color=blue)][issues]

[![License](https://img.shields.io/github/license/saagie/technologies?style=for-the-badge&color=blue)][license]

[![Contributors](https://img.shields.io/github/contributors/saagie/technologies?style=for-the-badge&color=blue)][contributors]

[releases]: https://github.com/saagie/technologies/releases
[contributors]: https://github.com/saagie/technologies/graphs/contributors
[issues]: https://github.com/saagie/technologies/issues
[license]: https://github.com/saagie/technologies/blob/master/LICENSE
[build_promote]: https://github.com/saagie/technologies/actions?query=workflow%3APROMOTE
[build_modified]: https://github.com/saagie/technologies/actions?query=workflow%3A%22BUILD+ONLY+MODIFIED%22

This repository contains all certified technologies used in Saagie.
It also contains some experimental technologies before being certified.

## CONTENTS

This repository contains all job and application technologies.
 
### Job technologies

A job technologie can be launch as a job in Saagie. It has :
- a name
- an icon
- some features to create a job
- one or more versions (each can be active/deprecated/inactive for the same technologie)

See "How to create a new job technologie" for more details

### Application technologies


An application technologie can be launch as an application in Saagie. It has : 
- a name
- an icon
- a description
- some default properties to create the application (ports, volumes, ...)


See "How to create a new application technologie" for more details 


## CONTRIBUTING


All contributions are made with the pull-request system.

### How to create a new job technologie


You create an issue and a pull-request associated. 

The build is running using a Github Action workflow (build only modified). It builds only technologies modified and generate a pre release containing assets. The name of the pre release = current version + name of the branch.

When you create a new technologie or a new version for a job, you need to specify some needed files (see current for inspiration).

Tree directories are strict :   
![tree_directory](./readme_assets/folder_directory.png)

two main root folders : "certified" and "experimental", then you need to specified if the technology is for a job or an application.
So you'll have : `certified/job` for a certified job technology.

Inside, each technology is under a folder (here : "java"), then each sub directories represents a version of this technology (here : 7,8 and 11 which was for all versions of java.)

filename | scope | description
--- | --- | ---
techno.yml | technology directory | this file describes the technology (the name, the icon, the availability, the reference to the docker repository)
version.yml | version directory | this file describes all informations about the version (features used, name of the version, the availability)
build.gradle.kts | version directory | build in this repository is made with gradle plugins. So you just need to apply theses plugins (just need a Dockerfile and a image_test.yml). You can also declare dependencies between build if you need to build this version from another in this repository (gradle will do the build using this dependency)
settings.gradle.kts | version directory | to set a name of the build version (need to be uniq in this repository)
Dockerfile | version directory | The Dockerfile of the version
image_test.yml | version directory | Each build need to be tested ... So we use [GoogleContainerTools/container-structure-test](https://github.com/GoogleContainerTools/container-structure-test) to test the generated image.
metadata.yml | version directory | This is a generated file, no need to have it, it will be created during the first build. It just a concatenation of the techno.yml and version.yml file with a correct docker image version.


### How to create a new application technologie


Work in progress

## Build


All was made with Github actions for this repository, but the main work was done by gradle (to be run in every CI).  

### Local

Just run `./gradlew localBuildModifiedJobs --parallel -Dversion.buildmeta=local`  
and it will build all modified images without push it with the "_local" suffix.

### Github Action

The workflow started at each push on the branch ... and it will generated docker images for modified technologies and generate a pre release in Github containing all assets.

### Promotion

When the pull-request is merged in master, another Github action (running a gradle task) starts. It will retag docker images with branch name into a "production" name and generate a real release (and delete the pre release)
