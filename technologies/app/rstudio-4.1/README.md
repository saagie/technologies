# Environment Variables

There are 2 mandatory environment variables: 
- $RSTUDIO_ADMIN_PASSWORD: Password for the user `admin`, with root permissions
- $RSTUDIO_PASSWORD: Password for the user `rstudio`


# Create new RStudio users

If you want to create new RStudio users, you'll need to log in to RStudio as: `admin` (password: `${RSTUDIO_ADMIN_PASSWORD}`).
Then go to '*Tools > Shell*' and run `sudo adduser my_new_user`.
You'll be prompted to enter admin's password, and then to choose your new user's password. No need to fill in the other fields.
If you want to allow this new user to install libraries, you need to add him to the *staff* group using the following command: `sudo adduser my_new_user staff`.

**Important note:** After you created a new user, remember to run `./backupusers`. This will backup users info in a tarball. If you add mounted a volume to `/home`, every user will be recreated on next container startup.


# How to install on Saagie

Create a custom app with the following options: 
- Image: saagie/rstudio
- Port: 80
- Basepath: SAAGIE_BASE_PATH
- Rewrite: No
- Persistant Storage: 128Mo
- Path: /home

## Build the image

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin). 

To build the project, go to the root of this project.
Then run:

```
./gradlew :rstudio-4.1:buildImage
```

If you want to test the image, you can run:
```
./gradlew :rstudio-4.1:testImage
```

### Using docker commands

First go to context/version sub-directory:

```
cd rstudio-4.1
```