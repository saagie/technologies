import sys
print(sys.executable)
print(sys.version)
print(sys.version_info)

###
### Test conda install
### FIXME find a way to test those installs
#from hdfs.hfile import Hfile
#import hdf5

###
### Test Jupyter specific
###
from PIL import Image
from google.protobuf import descriptor_pb2

###
### Test imports from python3
###
import addok
import apiclient
import bs4
import bokeh
import bs4
from confluent_kafka import Producer
import crypto
import cython
import django
import dryscrape
import elasticsearch
import excel
from fastparquet import ParquetFile
import fiona
import folium
import gensim
import geopandas
import geopy
import graphviz
import h5py
import hdfs
import autosklearn.classification
import thrift_sasl
from pybrain.tools.shortcuts import buildNetwork
import ibis
from imblearn.over_sampling import RandomOverSampler
from impala.dbapi import connect
import ipywidgets
import jellyfish
import joblib
from kafka import KafkaConsumer
from keras.layers import Dense
import lime
import lxml
import matplotlib
import mpld3
import mysql.connector
from neo4j import GraphDatabase
import networkx
import nltk
from numba import jit
import numpy
import cv2
import openpyxl
import pandas
from pdfminer.psparser import *
import psycopg2
from Crypto.Hash import SHA256
import pycurl
import pydotplus
import pymongo
import pyodbc
import shapefile
import pytesseract
from Levenshtein import _levenshtein
from requests_kerberos import *
from skimage import data
from sklearn import datasets
import scipy
import scrapy
import seaborn
import shap
import shapely
import simplejson
import six
import spacy
from sqlalchemy import create_engine
import statsmodels
import tabula
import tensorflow as tf
print('Num GPUs Available: ', len(tf.config.experimental.list_physical_devices('GPU')))
import tensorflow
import textract
import theano.tensor
import tika
import tokenizer
import torch
import torchvision
import tpot
import umap
from wand.image import Image
import xgboost
import xlwt
