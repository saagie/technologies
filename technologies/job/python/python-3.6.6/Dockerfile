FROM python:3.6.6-slim-stretch

COPY entrypoint /entrypoint
RUN chmod 755 /entrypoint

WORKDIR /sandbox

RUN apt update
RUN apt install -y unzip 

RUN pip --no-cache-dir install --upgrade pip

# LIBS PART BEGIN
RUN pip --no-cache-dir install numpy
RUN pip --no-cache-dir install h5py
RUN pip --no-cache-dir install ipywidgets 
RUN pip --no-cache-dir install pandas==0.21.1 
RUN apt-get install -y gcc python-matplotlib; pip --no-cache-dir install matplotlib 
RUN pip --no-cache-dir install scipy 
RUN pip --no-cache-dir install scikit-learn 
RUN apt-get install -y g++ unixodbc unixodbc-dev libpq-dev libsqlite3-dev; pip --no-cache-dir install pyodbc 
RUN pip --no-cache-dir install cython impyla
RUN pip --no-cache-dir install hdfs
RUN apt-get install -y libkrb5-dev; pip --no-cache-dir install hdfs[avro,dataframe,kerberos]
RUN pip --no-cache-dir install scikit-image
RUN pip --no-cache-dir install bokeh
RUN pip --no-cache-dir install tensorflow keras Theano
RUN pip --no-cache-dir install pybrain 
RUN pip --no-cache-dir install statsmodels 
RUN pip --no-cache-dir install mpld3 
RUN pip --no-cache-dir install networkx 
RUN pip --no-cache-dir install fiona 
RUN pip --no-cache-dir install folium 
RUN pip --no-cache-dir install shapely 
RUN apt-get install -y libsasl2-2 libsasl2-dev libsasl2-modules-ldap; pip --no-cache-dir install thrift-sasl==0.2.1
RUN pip --no-cache-dir install sasl 
RUN pip --no-cache-dir install SQLAlchemy 
RUN pip --no-cache-dir install ibis-framework 
RUN pip --no-cache-dir install pymongo 
RUN pip --no-cache-dir install seaborn
#PRODUCT-38-BEGIN
RUN apt-get install -y python-imaging tesseract-ocr libtesseract-dev; pip --no-cache-dir install pytesseract 
RUN pip --no-cache-dir install opencv-python 
RUN apt-get install -y leptonica-progs libmagickwand-dev libpng-dev libjpeg62-turbo-dev libtiff5-dev libwebp-dev libopenjp2-7-dev libgif-dev; pip --no-cache-dir install wand 
RUN pip --no-cache-dir install mysql-connector==2.2.9 
RUN pip --no-cache-dir install pyshp 
RUN pip --no-cache-dir install tpot
RUN pip --no-cache-dir install lime 
RUN pip --no-cache-dir install shap 
RUN pip --no-cache-dir install nltk 
RUN pip --no-cache-dir install gensim 
RUN pip --no-cache-dir install xgboost 
RUN pip --no-cache-dir install imbalanced-learn 
RUN apt-get install -y qt5-default libqt5webkit5-dev build-essential python-lxml python-pip xvfb;pip --no-cache-dir install dryscrape 
RUN pip --no-cache-dir install lxml 
RUN pip --no-cache-dir install scrapy 
RUN pip --no-cache-dir install bs4 
RUN pip --no-cache-dir install pydotplus 
RUN pip --no-cache-dir install elasticsearch 
RUN pip --no-cache-dir install psycopg2 
RUN pip --no-cache-dir install graphviz 
RUN pip --no-cache-dir install geopandas 
RUN apt-get install -y libgeos-dev;pip --no-cache-dir install geopy
#PRODUCT-38-END
#PRODUCT-335 BEGIN
RUN pip --no-cache-dir install tabula-py 
RUN pip --no-cache-dir install spacy 
RUN pip --no-cache-dir install pycrypto 
RUN pip --no-cache-dir install crypto 
RUN pip --no-cache-dir install tokenizer 
RUN pip --no-cache-dir install apiclient 
RUN pip --no-cache-dir install addok 
RUN pip --no-cache-dir install openpyxl 
RUN pip --no-cache-dir install jellyfish 
RUN pip --no-cache-dir install django 
RUN pip --no-cache-dir install joblib 
RUN pip --no-cache-dir install excel 
RUN pip --no-cache-dir install python-levenshtein 
RUN pip --no-cache-dir install xlwt 
RUN pip --no-cache-dir install tika 
RUN apt-get install -y swig pulseaudio libpulse-dev lame ffmpeg flac ;pip --no-cache-dir install textract 
RUN apt-get install -y libssl-dev libcurl4-openssl-dev;pip --no-cache-dir install pycurl 
RUN pip --no-cache-dir install neo4j-driver 
RUN pip --no-cache-dir install simplejson 
#PRODUCT-335 END
#PRODUCT-402 BEGIN
RUN pip --no-cache-dir install pdfminer.six
#PRODUCT-402 END 
RUN pip --no-cache-dir install umap-learn
RUN pip --no-cache-dir install numba
RUN pip --no-cache-dir install auto-sklearn
RUN pip --no-cache-dir install fastparquet
RUN pip --no-cache-dir install requests-kerberos==0.12.0
# LIBS PART END

#UPDATE SECURITY PACKAGE BEGIN
RUN apt-get update && apt-get upgrade -y
#UPDATE SECURITY PACKAGE END

RUN rm -rf /var/lib/apt/lists/*
RUN rm -rf /root/.cachex
RUN rm -rf /boot/.cache/pip
RUN rm -rf ~/.cache/pip

ENV LC_ALL C
ENV LD_RUN_PATH /usr/local/lib

RUN mkdir -p /root/.pip
COPY pip.conf /root/.pip/pip.conf

ENV DEBIAN_FRONTEND noninteractive
RUN echo "deb http://httpredir.debian.org/debian/ sid main">>/etc/apt/sources.list
RUN apt-get update;apt-get install -y krb5-user libpam-krb5 libpam-ccreds freeipa-client

# Libs for pycurl library
RUN apt-get install -y libgconf-2-4 libcurl3

# Fix Locale
RUN apt-get update && apt-get install locales -y &&\
    sed -i '/^#.* en_US.* /s/^#//' /etc/locale.gen &&\
    locale-gen
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8

ENTRYPOINT  ["bash","/entrypoint"] 
