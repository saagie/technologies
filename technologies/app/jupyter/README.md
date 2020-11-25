# Jupyter Datascience Notebook for python - customized by Saagie

This Docker image officially available on [Saagie's DockerHub](https://hub.docker.com/r/saagie/jupyter-python-nbk) is based on official [FROM jupyter/minimal-notebook:f9e77e3ddd6f](https://hub.docker.com/r/jupyter/minimal-notebook/) image.
(Note: the choosen tag is the latest with an Ubuntu OS version compatible with CDH5)

It is specially designed to run on Saagie's platform v2.

It relies upon a fist minimal image bases on jupyter official one plus some features required by Saagie's platform.
Then it provides the Saagie base image of Jupyter using the minimal image and including all the python librairies from Saagie's Python image [saagie/python:3.6-1.46.0](https://hub.docker.com/r/saagie/python)


## Build the image

### Using gradle build 

This gradle build is based on [Saagie's technology plugin](https://github.com/saagie/technologies-plugin) 

To build the project go up 3 directories to be at the root of this project.
Then run :

```
./gradlew :jupyter-base:buildImage
```

If you want to test the image you can run :
```
./gradlew :jupyter-base:testImage
```

### Using docker commands

First go to context/version sub-directory for the minimal image :

```
cd technologies/app/jupyter/jupyter-minimal
```

Then run the following command:
```
docker build -t saagie/jupyter-python-nbk:v2-minimal .
```
It builds the intermediate minimal image.

Then go to the base folder 
```
cd ../jupyter-base
```

And run :
```
docker build --build-arg BASE_CONTAINER=saagie/jupyter-python-nbk:v2-minimal -t saagie/jupyter-python-nbk:v2-app .
```

     
## Run Jupyter container

### On Saagie's Platform 

This container is supposed to be run on Saagie's platform.

Official documentation is available here : [Saagie's official documentation](https://docs.saagie.io/product/latest/sdk/index.html)

### On premise / your local server

Anyway, it is possible mainly for development and tests to run this image outside Saagie.
Please note that Saagie won't provide any support regarding images launched outside it's platform.

Simply run: 

```
docker run --rm --name jupyter -p 18888:8888 -v /path/to/persisten/folder/jupyter-workdir:/notebooks-dir saagie/jupyter-python-nbk:v2-app	
```

 * Port `8888` should be mapped to the one you will be using on host side (here `18888`).
 * SAAGIE_BASE_PATH variable is optional when run manually.
 * Mounting volume is optional (-v /path/to/persisten/folder/jupyter-workdir:/notebooks-dir) but if you want to do it:
 * create your local directory with: `mkdir -p /path/to/persisten/folder/jupyter-workdir`
 * make Jovyan (Jupyter notebook default user) the owner of this directory with: `chown -R 1000:1000 /path/to/persisten/folder/jupyter-workdir`

Then you'll be able to access Jupyter at http://localhost:18888


## Libraries :

### List of main libraries

	* Data Processing
		* numpy
    	* scipy
		* pandas

	* Machine Learning
    	* sklearn
		* keras
    	* pybrain (python 2 only)
    	* statsmodel
		* networkx

	* Data Visualisation
		* skimage
		* matplotlib
    	* bokeh
    	* mpld3
    	* folium

	* Database connection
		* pyodbc
    	* hdfs **
		* impyla
		* ibis-framework
		* SQLAlchemy
		* pymongo

	* Utils
    	* ipywidgets
		* fiona
 		* shapely

### List of librairies from Saagie's python image

    addok
    apiclient
    automl / auto-sklearn
    beautifulsoup4
    bokeh
    bs4
    confluent-kafka
    crypto
    cython
    django
    dryscrape
    elasticsearch
    excel
    fastparquet
    fiona
    folium
    gensim
    geopandas
    geopy
    graphviz
    h5py
    hdfs[avro,dataframe,kerberos]
    ibis-framework
    imbalanced-learn
    impyla
    ipywidgets
    jellyfish
    joblib
    kafka-python
    keras
    lime
    llvmlite
    lxml
    matplotlib
    mpld3
    mysql-connector
    neo4j-driver
    networkx
    nltk
    numba
    numpy
    opencv-python
    openpyxl
    pandas
    pdfminer.six
    psycopg2
    pybrain
    pycrypto
    pycurl
    pydotplus
    pymongo
    pyodbc
    pyshp
    pytesseract
    python-levenshtein
    requests-kerberos
    scikit-image
    scikit-learn
    scipy
    scrapy
    seaborn
    setuptools
    shap
    shapely
    simplejson
    six
    spacy
    SQLAlchemy
    statsmodels
    tabula-py
    tensorflow
    tensorflow-gpu
    textract
    Theano
    thrift-sasl
    tika
    tokenizer
    torch
    torchvision
    tpot
    umap-learn
    wand
    xgboost
    xlwt


## Install libraries with :
### For python 3
	!pip install libraryName

### For python 2
	!pip2 install libraryName
