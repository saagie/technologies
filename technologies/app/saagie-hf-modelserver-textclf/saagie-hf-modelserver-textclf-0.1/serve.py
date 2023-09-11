#%% Dependencies
import os
import logging
import numpy as np
import pandas as pd
import torch
import ast
from datetime import datetime

from flask import Flask, jsonify, request
from flask import current_app, abort, Response
import dash
import dash_bootstrap_components as dbc
import dash_html_components as html
import dash_core_components as dcc
from dash.dependencies import Input, Output, State

## Logger, App, Device config
logging.basicConfig(level=logging.INFO, format='%(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from transformers import TextClassificationPipeline, AutoModelForSequenceClassification, AutoTokenizer, AutoConfig




#%% App Layout
# Dash with Responsive UI
app = dash.Dash(__name__
                , meta_tags=[{"name": "viewport", "content": "width=device-width, initial-scale=1"}] 
                , external_stylesheets=[dbc.themes.BOOTSTRAP]
                , url_base_pathname=os.environ["SAAGIE_BASE_PATH"]+"/")
## Flask Server
server = app.server


## Layout Params
btn_color = "primary"
border_color = "#D9DBE3"
border_radius = 6
btn_style = {"height": 40, "width": 100, "border-radius":border_radius}
layout_col_width = 5
bg_color = 'white'
text_color = '#263D5C' 
text_color2 = '#587193'
banner_color = '#1F3046'
padding_style = {'margin-left' : '30px', 'margin-top' : '30px', 'background-color': bg_color, 'color': text_color}
text_area_style = {'height': '20%', 'width': '100%', 'border-color': border_color, 'margin-bottom' : '18px'}

desc = "Custom Saagie app that deploys the deep learning text classification models from HuggingFace and makes predictions via the GUI.  \n\n\n\n"
## Model For Testing
classes = ' anger 🤬 | disgust 🤢 | fear 😨 | joy 😀 | neutral 😐 | sadness 😭 | surprise 😲 '
model = 'j-hartmann/emotion-english-distilroberta-base'


## Layout
app.layout = dbc.Container(fluid=True,children=[
    ## Title
    dbc.Row([
        dbc.Col([
            html.H2("Saagie HuggingFace Model Server - Text CLF"),
            ], width = 10),
        dbc.Col([
            html.H4("🛈", title=desc)
            ], width = 2)
        ]
    , style={'background-color': banner_color, 'color': 'white', 'margin-bottom' : '80px', 'padding-top': '40px', 'padding-left': '60px', 'padding-bottom': '40px'}
    ),
    
    ## Main App
    dbc.Col([
        dbc.Row([
            ## Left part: deployment
            dbc.Col([
                ## Model and label for the deployment
                html.H6("Model Name"), 
                dcc.Textarea(id='modeldir'
                    , value= 'Enter the HuggingFace model repository, e.g. \n'+model
                    , style=text_area_style
                    ), 
                html.H6("Label"), 
                dcc.Textarea(id='modellabel'
                    , value= 'Enter the model class label, e.g. \n'+classes
                    , style=text_area_style
                    ), 
                ## Deploy button
                dbc.Row(dbc.Button("Deploy"
                    , id="deploy"
                    , n_clicks=0
                    , size='sm'
                    , style={"height": 40, "width": 100, "color": "#132d81", "background-color": "#cef0fd", 'border-color': "White", "border-radius":border_radius, 'margin-bottom' : '27px'})
                    , justify="center"
                    ),
                ## Deploy loading icon
                dbc.Row(dcc.Loading(id="loading"
                    , type="circle"
                    , children='Loading Model'
                    , color="#132d81")
                    , justify="center"
                    ),
                html.P(id='placeholder', children=''), 
            ]
            , width=layout_col_width 
            , style={'margin-left' : '60px', 'margin-top' : '30px', 'background-color': bg_color, 'color': text_color, "border-right": "1px solid #d9dbe3", "padding-right": "4%"}
            ),

            ## Right part: Inference
            dbc.Col([
                ## Text-Input
                html.H6("Text Classification"), 
                dcc.Textarea(id='pred_in'
                    , value='Enter the text to predict'
                    , style={'height': '32%', 'width': '100%', 'border-color': border_color, 'margin-bottom' : '18px'}
                    ),
                ## Inference button
                dbc.Row(dbc.Button("Predict", id="predict", n_clicks=0, size='sm', color=btn_color, style=btn_style), justify="center", style={'margin-bottom' : '18px'}
                        ),
                ## Predictions
                html.H6("Inference Results"), 
                dcc.Textarea(id='pred_out'
                    , value='Predictions'
                    , style = {'height': '25%', 'display': 'block', 'border-color': border_color, 'width': '100%', 'background-color' : 'white', 'color' : "#587193"}
                    ),
                html.H5("")
                ]
                , width=layout_col_width 
                , style=padding_style
                ),
            ]),
            ## padding bottom space
            dbc.Row([html.H6('.  ')], style = {'color': bg_color}), 
        ])
    ], style = {'background-color': bg_color, 'color': text_color}
    )
    
  


#%% App functions
device = "cpu"

def pipeline_predict(input_texts: list, pipeline):
    return pipeline(input_texts)

def list_to_string(l: list):
    # print(l)
    return '\n'.join([', '.join(["%s: %s"%(k,v) if type(v) == str else "%s: %.4f"%(k,v) for k, v in item.items()]) for item in l])

def model_to_pipeline(model_tag: str, modellabel: str):
    if ':' in model_tag:
        model_name = model_tag.split(':')[0]
        model_ver = model_tag.split(':')[1]
    else:
        model_name = model_tag
        model_ver = "main"
    ## split labels with "|"
    label_dict = {index: element for index, element in enumerate(modellabel.split('|'))}
    ## create related prediction pipeline
    config = AutoConfig.from_pretrained(model_name, id2label=label_dict, revision=model_ver) #ast.literal_eval(label_dict)) ## Config strongly depending on model
    model = AutoModelForSequenceClassification.from_pretrained(model_name, config=config, revision=model_ver)
    tokenizer = AutoTokenizer.from_pretrained(model_name, revision=model_ver)
    return model, tokenizer, model_name, model_ver


## Predict
@app.callback(
    Output(component_id = 'pred_out', component_property = 'value'),
    [Input(component_id = 'predict', component_property = 'n_clicks')],
    [State(component_id = 'pred_in', component_property = 'value')],
)
def predict(click, input_texts):
    if click:
        ## make predictions using deployed pipeline
        logger.info('-- PREDICT function called --')
        input_texts = input_texts.split('\n')
        global pipeline
        pred = pipeline_predict(input_texts, pipeline)
        return list_to_string(pred)
    else: 
        return ' '


## Deploy a model
@app.callback(
    Output(component_id = 'loading', component_property = 'children'),
    [Input(component_id = 'deploy', component_property = 'n_clicks')],
    [State(component_id = 'modeldir', component_property = 'value'),
     State(component_id = 'modellabel', component_property = 'value')
     ],
)
def deploy(click, model_tag, modellabel):
    if click:
        # logger.debug('-- DEPLOY function called --')
        logger.info('-- DEPLOY function called --')
        try:
            ## create related pipeline
            model, tokenizer, model_name, model_ver = model_to_pipeline(model_tag, modellabel)
            global pipeline
            pipeline = TextClassificationPipeline(model=model, tokenizer=tokenizer)
            logger.info('-- Pipeline Deployed--')
            logger.info(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+model_name+':'+model_ver)
            return model_name+':'+model_ver+' is deployed.'
        except Exception as err:
            return model_name+':'+model_ver+' is not deployed due to ' + str(err)
    else:
        return ''


@server.route('/deploy', methods=['POST'])
def deploy_api():
    # Read inputs/classes or Return reason of abort
    if 'model_dir' in request.json and 'label' in request.json:
        model_dir = request.json['model_dir']
        label = request.json['label']
        global classes 
        global model
        classes = label
        model = model_dir
    else:
        abort(Response('Json not understandable, make sure that you have "model_dir" and "label" key.'))
    logger.info('-- DEPLOY API called --')
    try:
        ## make deployments via API
        model, tokenizer, model_name, model_ver = model_to_pipeline(model_dir, label)
        global pipeline
        pipeline = TextClassificationPipeline(model=model, tokenizer=tokenizer)
        logger.info('-- Pipeline Deployed--')
        logger.info(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+model_name+':'+model_ver)
        return jsonify({'response': model_name+':'+model_ver+' is deployed.'}), 201
    except Exception as err:
        return jsonify({'response': model_name+':'+model_ver+' is not deployed due to ' + str(err)}), 501


@server.route('/predict', methods=['POST'])
def predict_api():
    # Read inputs/classes or Return reason of abort
    logger.info('-- PREDICT API called --')
    if 'inputs' in request.json:
        ## make predictions via API
        input_texts = request.json['inputs']
        pred = pipeline_predict(input_texts, pipeline)
    else:        
        abort(Response('Json not understandable, make sure that you have "inputs" key.'))
    return jsonify(pred), 201
        
    
if __name__ == '__main__':
    app.run_server(host='0.0.0.0', debug=False, port=8080, dev_tools_hot_reload=True)