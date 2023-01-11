# Contributing

This document will guide you through the process of contributing to the official Saagie technologies catalog. This repository is only accessible to Saagie employees, and to contribute you must have the write access to this repository. If you don't have the write access, please open an internal ticket on the DSI's team form.

For non-Saagie employees, contributing to the repository [technologies-community](https://github.com/saagie/technologies-community) is accessible to anyone.

This repository has an automated build system that will automatically build the Docker images added or modified, tag them with the version number, and add them to the Saagie catalog by modifying the dockerinfo.yaml file. The build system will also automatically update metadata.yaml file by combining the dockerInfo.yaml and context.yaml files for each technology version with the technology.yaml file.

## Open an issue

The first step to contributing is to open an issue at [this URL](https://github.com/saagie/technologies/issues/new/choose). A bot will automatically report the issue in out internal issue tracker and generate a unique issue id (for example SDKTECHNO-123).

## Create a branch

Create a branch with the unique issue id as the name. For example, if the issue id is SDKTECHNO-123, the branch name should be `SDKTECHNO-123`. Always start from an up-to-date master branch to create your branch. Here's the commands necessary to create a branch:

```bash
git checkout master
git pull
git checkout -b SDKTECHNO-123
```

## Implement your modifications

Once you have created your branch, you can start implementing your modifications. You can find the documentation for the technologies catalog in the repository [README](https://github.com/saagie/technologies/blob/master/README.md).

## Commit and push your modifications

Once you have implemented your modifications, you can commit and push them. Here's the commands necessary to commit and push your modifications:

```bash
git add .
git commit -m "SDKTECHNO-123: Add my technology"
git push origin SDKTECHNO-123
```

When the build system will detect your modifications, it will automatically create a new unique tag for the release and build the Docker images added or modified. You can see the build status in the [Actions](https://github.com/saagie/technologies/actions) tab of the repository.

If the build fails, look at the logs of the build to see what went wrong. Don't forget to pull the latest changes from your branch before pushing your modifications because a new commit have been pushed by the build system to add the tag informations in the files.

If the build is successful, a new tag will be accessible in the [Tags](https://github.com/saagie/technologies/tags) tab of the repository. You can install this catalog in your Saagie instance to test your modifications.

## Create a pull request

Once you have tested your modifications, you can create a pull request to merge your branch into the master branch. You can do this by clicking on the "Compare & pull request" button on the [Pull requests](https://github.com/saagie/technologies/compare) tab of the repository. You can then link the github issue previously created and add a description of your modifications and click on the "Create pull request" button. At least one reviewer will have to review your pull request before it can be merged.

## Merge your pull request

Once your pull request has been reviewed and approved, you can merge it into the master branch. You can do this by clicking on the "Merge pull request" button in the pull request page. You can then click on the "Confirm merge" button to merge your pull request. The branch will be automatically deleted after the merge.

## Release your modifications

Once your pull request has been merged, the build system will automatically create a new release with the tag created by the build system. You can see the release in the [Releases](https://github.com/saagie/technologies/releases) tab of the repository. You can then update the catalog in your Saagie instance to access your modifications.
