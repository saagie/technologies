ReleaseNotes
============

This image is deprecated as R automatically updates R 3.6.x to 3.6.3 at least.
No changes should be made here anymore.

Changes by date
---------------

### 2020-11-18
 - remove r-cran-cluster binaries as it's redundant 
 - remove r-cran-rpart binaries as it's redundant
 - remove r-cran-prophet binaries as there are dependencies problems and install it from sources

### 2020-06-16
 - Replacement of TSclust (due to deprecation by cran) by dtwclust (https://cran.r-project.org/web/packages/dtwclust/dtwclust.pdf)
 
 