> [!NOTE] 
> This Docker image is designed to run on Saagie’s V2 platform. It is available on <a href="https://hub.docker.com/r/saagie/jupyter-python-nbk" target="_blank">Saagie’s DockerHub</a> and is based on the official Jupyter Docker Stacks image, <a href="https://hub.docker.com/r/jupyter/minimal-notebook/" target="_blank">FROM jupyter/minimal-notebook:f9e77e3ddd6f</a>. The chosen tag is the latest with a CDH5-compatible version of the Ubuntu OS.
> 
> This Docker image relies on a first minimal image based on the official Jupyter image, plus some features required by the Saagie platform. It then provides the Saagie base image of Jupyter using the minimal image and includes all the Python libraries of the Saagie Python image.

## How to launch Jupyter Notebook?

To make Jupyter Notebook work on your platform, there are no special steps to take.

You can directly click **Install** to install your app.

## How to use the `jupyter_ai` plugin?

> [!IMPORTANT] 
> You can use the `jupyter_ai` plugin only with the `JupyterLab+GenAI 4.0 Python 3.10` context.

1. On your Saagie platform, create an <a href="https://docs.saagie.io/user/latest/data-team/projects-module/projects/managing-environment-variables#creating-environment-variables" target="_blank">environment variable</a> that is based on the model provider you want to use:

    | Name           | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 
    |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `PROVIDER_KEY` | This is your API key for the model provider you want to use. Where `PROVIDER_KEY` must be replaced with the environment variable name of the desired provider. You can find all the models in the <a href="https://jupyter-ai.readthedocs.io/en/latest/users/index.html#model-providers" target="_blank">Jupyter AI documentation</a>.<br/>For example, if you want to use OpenAI's ChatGPT model, you must create an environment variable named `OPENAI_API_KEY`. For more information, see how to <a href="https://docs.saagie.io/user/latest/how-to/notebooks/python-with-gen-ai" target="_blank">use Generative AI in Jupyter Notebook</a>. |


## How to install libraries?

The Jupyter app provided by Saagie already includes many libraries. They are listed below. 

However, if you need other libraries, install them by running the following command line:

```
!pip install libraryName
```
Where `libraryName` must be replaced with the name of the desired library. 

<details>

<summary>Jupyter’s Main Libraries</summary>

| Category            | Library Name                                                                     |
|---------------------|----------------------------------------------------------------------------------|
| Data Processing     | - `numpy`<br/>- `scipy`<br/>- `pandas`                                                 |
| Machine Learning    | - `sklearn`<br/>- `keras`<br/>- `statsmodel`<br/>- `networkx` |
| Data Visualisation  | - `skimage`<br/>- `matplotlib`<br/>- `bokeh`<br/>- `mpld3`<br/>- `folium`                  |
| Database connection | - `pyodbc`<br/>- `hdfs`<br/>- `impyla`<br/>- `ibis-framework`<br/>- `SQLAlchemy`<br/>- `pymongo` |
| Utils               | - `ipywidgets`<br/>- `fiona`<br/>- `shapely`                                           |
</details>

<details>

<summary>Saagie Python Image Libraries</summary>

- `addok`
- `apiclient`
- `automl` / `auto-sklearn`
- `beautifulsoup4`
- `bokeh`
- `bs4`
- `confluent-kafka`
- `crypto`
- `cython`
- `django`
- `dryscrape`
- `elasticsearch`
- `excel`
- `fastparquet`
- `fiona`
- `folium`
- `gensim`
- `geopandas`
- `geopy`
- `graphviz`
- `h5py`
- `hdfs[avro,dataframe,kerberos]`
- `ibis-framework`
- `imbalanced-learn`
- `impyla`
- `ipywidgets`
- `jellyfish`
- `joblib`
- `kafka-python`
- `keras`
- `lime`
- `llvmlite`
- `lxml`
- `matplotlib`
- `mpld3`
- `mysql-connector`
- `neo4j-driver`
- `networkx`
- `nltk`
- `numba`
- `numpy`
- `opencv-python`
- `openpyxl`
- `pandas`
- `pdfminer.six`
- `psycopg2`
- `pybrain`
- `pycrypto`
- `pycurl`
- `pydotplus`
- `pymongo`
- `pyodbc`
- `pyshp`
- `pytesseract`
- `python-levenshtein`
- `requests-kerberos`
- `scikit-image`
- `scikit-learn`
- `scipy`
- `scrapy`
- `seaborn`
- `setuptools`
- `shap`
- `shapely`
- `simplejson`
- `six`
- `spacy`
- `SQLAlchemy`
- `statsmodels`
- `tabula-py`
- `tensorflow`
- `tensorflow-gpu`
- `textract`
- `Theano`
- `thrift-sasl`
- `tika`
- `tokenizer`
- `torch`
- `torchvision`
- `tpot`
- `umap-learn`
- `wand`
- `xgboost`
- `xlwt`

</details>

***
> _For more information on Jupyter, see the <a href="https://docs.jupyter.org/en/latest/" target="_blank">official documentation</a>_


<!-- ## How to build the image in local?

You can build the image with Gradle or Docker.
- Gradle builds take place at the root of the project.
- Docker builds take place in the technology specific directory.

### Using the Gradle Build

This Gradle build is based on our [technology plugin](https://github.com/saagie/technologies-plugin). To build the image in local with it, follow the steps below.

1. Build the project. 
   1. Navigate to the root of the project.
   2. Run the following line of code:
      ```
      ./gradlew :jupyter-base:buildImage
      ```
2. **OPTIONAL**: Test the image by running the following line of code:
    ```
    ./gradlew :jupyter-base:testImage
    ```

### Using Docker Commands

To build the image in local with Docker commands, follow the steps below.

1. Navigate to the technology version subdirectory `technologies/app/jupyter/jupyter-minimal`:
    ```bash
    cd technologies/app/jupyter/jupyter-minimal
    ```
2. Run the following command:
    ```bash
    docker build -t saagie/jupyter-python-nbk:v2-minimal .
    ```
   It builds your intermediate minimal image.
3. Navigate to the technology version subdirectory `technologies/app/jupyter/jupyter-base`:
    ```bash
    cd ../jupyter-base
    ```
4. Run the following command:
    ```bash
    docker build --build-arg BASE_CONTAINER=saagie/jupyter-python-nbk:v2-minimal -t saagie/jupyter-python-nbk:v2-app .
    ```

## How to run the image?

### On Saagie's Platform 

This container is designed to run on Saagie’s platform. For more information, see our [SDK documentation](https://docs.saagie.io/user/latest/developer/sdk/).

### On Your Local Machine

You can also run this image outside Saagie. This use case can be useful mainly for development and testing. However, please note that we are unable to provide support for images that are run outside of your Saagie platform.

1. Run the following command. It will launch a Docker container with the Jupyter version and configurations that you want to use.
    ```bash
    docker run --rm -p 18888:8888 --name jupyter \
    -v /path/to/persistent/folder/jupyter-workdir:/notebooks-dir \
    saagie/jupyter-python-nbk:v2-app
    ```
   Where:
   - Port `8888` must be mapped to the port you will use on the host side. For example, `18888`.
   - The `SAAGIE_BASE_PATH` environment variable is **optional** when you run the app manually.
   - The `-v /path/to/persistent/folder/jupyter-workdir:/notebooks-dir` parameter is **optional**. It mounts the local directory `/path/to/persistent/folder/jupyter-workdir` on the host into the directory `/notebooks-dir` inside the container. This allows you to keep data between container runs, such as Jupyter notebooks and files. If you need to use this parameter, you must:
     - Create your local directory with `mkdir -p /path/to/persistent/folder/jupyter-workdir`.
     - Make Jovyan, the default Jupyter Notebook user, the owner of this directory with `chown -R 1000:1000 /path/to/persistent/folder/jupyter-workdir`.
2. Access your local image at `http://localhost:18888`. -->