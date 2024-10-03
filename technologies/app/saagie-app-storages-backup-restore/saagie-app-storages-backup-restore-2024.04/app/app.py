# pylint: disable=line-too-long

import dash_mantine_components as dmc
import dash_loading_spinners as dls
from dash import Dash, html, dcc, callback, Input, Output, Patch, ctx
import dash_ag_grid as dag

from tools.tools import *
import os
from scripts import script_restore, script_backup
from saagieapi import SaagieApi
import boto3

columnDefsBackUp = [
    {
        "field": "projet",
        "headerName": "Nom du projet",
        "checkboxSelection": True,
        "headerCheckboxSelection": True,
        "headerCheckboxSelectionFilteredOnly": True,
    },
    {
        "field": "project_id",
        "headerName": "ID du projet",
    },
    {
        "field": "app_name",
        "headerName": "Nom de l'app",
        # stockLink function is defined in the dashAgGridComponentFunctions.js in assets folder
        # "cellRenderer": "StockLink",       
    },
    {
        "field": "app_id",
        "headerName": "ID de l'app",
    },
    {
        "field": "last_backup",
        "headerName": "Date du dernier backup",
    },
    {
        "field": "app_url",
        "headerName": "url de l'app",
        # stockLink function is defined in the dashAgGridComponentFunctions.js in assets folder
        "cellRenderer": "StockLink",
        # "hide": True
    }
]




url = os.environ['BACKUP_URL']
pf = os.environ['BACKUP_PF_ID']
platformLogin = os.environ['BACKUP_USER']
platformPwd = os.environ['BACKUP_PWD']
realm = get_realm_from_url(url)
endpoint_url = os.environ["BACKUP_S3_ENDPOINT"]
region_name = os.environ["BACKUP_REGION_NAME"]
s3_bucket_name = os.environ["BACKUP_S3_BUCKET_NAME"]  # Bucket name on S3, e.g. saagie-backup
app_prefix = os.environ["BACKUP_TMP_APP_PREFIX"]  # Prefix of this app name
backup_project_id = os.environ["BACKUP_APP_PROJECT_ID"]  # id du projet où est hébergé l'addOn

saagie = SaagieApi(url_saagie=url, id_platform=pf, user=platformLogin, password=platformPwd, realm=realm)
# récupération des infos du projet où se trouve l'app backup
info_projet_backup = saagie.projects.get_info(project_id=backup_project_id)['project']
print(f"{info_projet_backup=}")
#####################################################################################
# si les infos contiennent "None" => on n'est pas sur la bonne plateforme
if info_projet_backup == None:
    print(f"pf =  {pf}")
    print(f'info none : {info_projet_backup}')
    if pf == 1:
        pf = 2
    else:
        pf = 1
    saagie = SaagieApi(url_saagie=url, id_platform=str(pf), user=platformLogin, password=platformPwd, realm=realm)
    info_projet_backup = saagie.projects.get_info(project_id=backup_project_id)['project']
    print(f"pf =  {pf}")
    print(info_projet_backup)

#####################################################################################
# récupération de la date du dernier backup pour chaques apps dans le bucket

# Connect to S3
s3_client = boto3.client("s3",
                         endpoint_url=os.environ["BACKUP_S3_ENDPOINT"],
                         region_name=os.environ["BACKUP_REGION_NAME"],
                         aws_access_key_id=os.environ["BACKUP_S3_ACCESS_KEY_ID"],
                         aws_secret_access_key=os.environ["BACKUP_S3_SECRET_ACCESS_KEY"])

# Check if the bucket exist, if not create it
bucket_exist = [True for bucket in s3_client.list_buckets()["Buckets"] if bucket["Name"] == s3_bucket_name]
if not bucket_exist:
    # raise Exception(f"The bucket [{s3_bucket_name}] does not exist")
    logging.info(f"Bucket [{s3_bucket_name}] does not exist, creating it")
    s3_client.create_bucket(Bucket=s3_bucket_name)

# récupération de la liste des chemins dans le bucket
list_paths_backup = list_objects_with_prefix(s3_client, s3_bucket_name, prefix=f"")
if not list_paths_backup:
    logging.info(f"No backup found")

# construction d'un dictionnaire contenant toutes les dates de backup pour chaque app_id
list_dates_backup = list_path_to_dict(list_paths_backup)
# construction d'un dictionnaire contenant uniquement la max_date de backup pour chaque app_id
list_max_dates_backup = get_max_date_list(list_dates_backup)


# to run on Saagie Platform
# eviter les erreurs sur les call back définie en dehors du rendu principal
app = Dash("AddOn Backup/Restore",
           url_base_pathname=os.environ["SAAGIE_BASE_PATH"] + "/",
           suppress_callback_exceptions=True)
# to run locally
# app = Dash(__name__)


app.layout = dmc.MantineProvider(
    children=[
        html.Div(id="sui-root", children=[
            html.Div(
                id="header",
                style={'background-color': '#1F3046'},
                className="sui-g-grid as--middle sui-h-pv-md sui-h-ph-lg",
                children=[
                    html.Div(
                        className="sui-g-grid__item as--auto",
                        children=[
                            html.Img(id="logo", src="assets/images/saagie-logo.png", width="70px"),
                        ],
                    ),
                    html.Div(
                        id="header-text",
                        className="sui-g-grid__item as--auto",
                        children=[
                            html.Span("- AddOn Backup/Restore", className="sui-h-text-lg sui-h-text-white")
                        ],
                    ),

                ],
            ),
            html.Div(
                id="body",
                className="body",
                children=[
                    # onglet par défaut
                    dcc.Tabs(id="tabs", parent_className="sui-m-tabs as--lg", className="sui-m-tabs__wrapper",
                             value='tab-backup',

                             children=[
                                 dcc.Tab(label='Backup', value='tab-backup', className="sui-m-tabs__item",
                                         selected_className="as--active"),
                                 dcc.Tab(label='Restore', value='tab-restore', className="sui-m-tabs__item",
                                         selected_className="as--active"),
                             ]
                             ),

                    dls.Clip(
                        # pour du fun : https://dash-bootstrap-components.opensource.faculty.ai/docs/components/spinner/
                        id="loading-1",
                        color='#134681',
                        speed_multiplier=1.5,
                        width=50,
                        # type="default",
                        fullscreen=True,
                        children=[
                            # div contenu des onglets
                            html.Div(id='tabs-content', className="sui-l-layout__page"),
                            # div retour click bouton
                            # html.Div(id='selected-app', children=[],style={'color': 'green'}),
                            # intégration de la notification
                            html.Div(
                                id='notification',
                                style={'display': 'none'},
                                className="sui-o-notification",
                                children=[
                                    html.Div(
                                        className="sui-o-notification__item as--success",
                                        children=[
                                            html.Div(id='action-return'),
                                            # dcc.Link(id='app-link', target="_blank", href="", title="Voir l'application restaurée"),
                                            html.A(id='app-link', target="_blank", title="Voir l'application",
                                                   children="Voir l'application"),
                                            html.Button(id='btn-close-notification', className="sui-o-notification__clear")
                                        ]
                                    )
                                ]
                            )
                        ]
                    )],
            ),
        ])
    ],
)




########################################## onglet ##########################################
@callback(
    Output('tabs-content', 'children'),
    Input('tabs', 'value')
)
def render_content(tab):
    if tab == 'tab-backup':
        return html.Div(
            className="sui-l-container as--gutter-horizontal-lg",
            children=[
                html.Div(
                    className="sui-m-card sui-h-mb-sm",
                    children=[
                        html.Div(
                            className="sui-m-card__content sui-h-p-none",
                            children=[
                                dmc.Accordion(
                                    children=get_settings(),
                                    multiple=True
                                ),
                            ],
                        ),
                    ],
                ),
                # test selection + filtre : https://dash.plotly.com/dash-ag-grid/checkbox-row-selection
                html.Div(children=[
                    html.Div(
                        className="sui-h-mb-md",
                        children=[
                            html.Div(className="sui-g-grid as--middle", children=[
                                html.Div(className="sui-g-grid__item as--fill", children=[
                                    html.Div(className="sui-m-search-bar",
                                             children=[
                                                 html.Span(className="sui-m-search-bar__icon",
                                                           children=[html.I(className="sui-a-icon as--fa-search")]),
                                                 dcc.Input(id="input-filter", placeholder="Filtrez par nom...",
                                                           className="sui-a-form-control"),
                                             ]
                                             ),
                                ]),
                                html.Div(className="sui-g-grid__item as--auto", children=[
                                    html.Button('Backup now', id='submit-val', className="sui-a-button as--primary"),
                                ]),
                            ]),
                        ]
                    ),
                    html.Div(className="sui-m-card", children=[
                        html.Div(className="sui-m-card__content", children=[
                            dag.AgGrid(
                                id="apps_table",
                                # rowClass="sui-o-datalist__row",
                                columnDefs=columnDefsBackUp,
                                rowData=list_projects(saagie, list_max_dates_backup, url, pf).to_dict('records'),
                                columnSize="sizeToFit",
                                selectedRows=[],
                                defaultColDef={
                                    "filter": True,
                                    # "filterParams": {"buttons": ["reset", "apply"],},
                                    "sortable": True,
                                    # "resizable": True,
                                },
                                dashGridOptions={
                                    "rowMultiSelectWithClick": True,
                                    "rowSelection": "multiple",
                                    "animateRows": False,
                                    'pagination': True,
                                    'paginationPageSize': 10,
                                    # "paginationAutoPageSize": True,
                                    "paginationPageSizeSelector": False
                                },
                            ),
                        ]),
                    ]),
                ]),
            ])
    elif tab == 'tab-restore':
        return html.Div(
            className="sui-l-container as--gutter-horizontal-lg",
            children=[
                # bloc settings
                html.Div(
                    className="sui-m-card sui-h-mb-sm",
                    children=[
                        html.Div(
                            className="sui-m-card__content sui-h-p-none",
                            children=[
                                dmc.Accordion(
                                    children=get_settings(),
                                    multiple=True
                                ),
                            ],
                        ),
                    ],
                ),
                html.Div(
                    className="sui-m-card",
                    children=[
                        html.Div(
                            className="sui-m-card__content sui-h-pv-xl",
                            children=[
                                html.Div(
                                    className="sui-g-grid as--gutter-vertical-xxl",
                                    children=[
                                        html.Div(
                                            className="sui-g-grid__item",
                                            children=[
                                                # selection du backup à restaurer
                                                dmc.Select(
                                                    className="sui-a-form-control as--primary",
                                                    data=get_select_data(saagie, list_path_to_dict(list_paths_backup)),
                                                    searchable=True,
                                                    clearable=True,
                                                    label="Liste des backups disponibles",
                                                    placeholder="Select an app to backup",
                                                    id="app-select",
                                                    w=400,
                                                ),
                                            ]
                                        ),
                                        html.Div(
                                            id="date-select-wrapper",
                                            className="sui-g-grid__item",
                                            children=[
                                                # dates des backup disponibles
                                                dmc.Select(
                                                    data=[],
                                                    searchable=True,
                                                    # clearable=True,
                                                    label="Dates des backups",
                                                    placeholder="Select a date",
                                                    id="date-select",
                                                    w=400,
                                                ),
                                            ]
                                        ),
                                        html.Div(
                                            className="sui-g-grid__item",
                                            children=[
                                                html.Button('Restore', id='submit-restore',
                                                            className="sui-a-button as--primary", disabled=True),
                                            ]
                                        ),
                                    ],
                                ),

                                # dmc.Text(id="selected-app-to-restore"),
                                # dmc.Text(id="selected-date-to-restore"),
                                dmc.Text(id="info-restore"),
                            ]
                        ),
                    ]
                ),
            ])


####################################### selection de l'app à restaurer ######################################
@callback(
    Output("date-select", "data"),
    # Output("date-select", "value"),
    Output("submit-restore", "disabled", allow_duplicate=True),
    Output("date-select", "disabled"),
    Input("app-select", "value"),
    # Input("date-select", "value")
    prevent_initial_call=True
)
def select_value(value_app):
    print(f"value app to restore=  {value_app}")
    dates = []
    if not value_app == None:
        print("a")
        for project_id, apps_list in list_dates_backup.items():
            for app_id in apps_list.keys():
                if value_app == app_id:
                    # print(f"date =  {apps_list[app_id]}")
                    dates = apps_list[app_id]
        disabled = False
    else:
        print("b")
        dates = []
        disabled = True

    print("-----------")
    print(f"disabled=  {disabled}")
    print(f"dates=  {dates}")
    # print(f"value_date=  {value_date}")
    # return dates, value_date, disabled
    return dates, disabled, disabled


@callback(
    Output("submit-restore", "disabled"),
    Input("date-select", "value"))
def select_value(value):
    # print(f"value date backup=  {value}")
    retour = True
    if not value == None:
        # lancer la restauration de l'app avec la date de backup choisie
        # time.sleep(5)
        # retour  "Restaurer à partir du backup du " + value
        retour = False
    return retour


########################################## BOUTON RESTORE ##########################################
@callback(
    Output("info-restore", "children"),
    Output("action-return", "children", allow_duplicate=True),
    Output("notification", "style", allow_duplicate=True),
    Output("app-link", "href"),

    Input(component_id='app-select', component_property='value'),
    Input(component_id='date-select', component_property='value'),
    Input(component_id='submit-restore', component_property='n_clicks'),
    prevent_initial_call=True
)
def prepare_restore(value_app, value_date, n_clicks):
    # print("prepare_restore")
    patched_children = Patch()
    # if n_clicks:
    if ctx.triggered_id == "submit-restore":
        # recupération de l'app_id à restaurer
        print(f"value_app=  {value_app}")
        # recupération de la date du backup à restaurer
        print(f"value_date=  {value_date}")
        # mise à jour des envvar
        message = ""

        if value_app and len(value_app) > 0:
            #########################################################
            # maj de l'envvar en local
            print(f"local RESTORE_LIST_APP_ID avant maj : {os.environ.get('RESTORE_LIST_APP_ID')}")
            os.environ['RESTORE_LIST_APP_ID'] = value_app
            test = os.environ['RESTORE_LIST_APP_ID']
            print(f"local RESTORE_LIST_APP_ID après maj : {test}")

            print(f"local RESTORE_DATE avant maj : {os.environ.get('RESTORE_DATE')}")
            os.environ['RESTORE_DATE'] = value_date
            test = os.environ['RESTORE_DATE']
            print(f"local RESTORE_DATE après maj : {test}")

            #########################################################
            # maj de l'envvar projet
            logging.info(f"----- Updating environment variables RESTORE_LIST_APP_ID...")
            logging.info(f"pf_id : {pf}")
            saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="RESTORE_LIST_APP_ID",
                value=value_app,
                description="List of apps to backup",
                project_id=backup_project_id
            )
            logging.info(f"----- Fin Updating environment variables RESTORE_LIST_APP_ID")

            logging.info(f"----- Updating environment variables RESTORE_DATE...")
            logging.info(f"pf_id : {pf}")
            saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="RESTORE_DATE",
                value=value_date,
                description="Date of selected backup to restore",
                project_id=backup_project_id
            )
            logging.info(f"----- Fin Updating environment variables RESTORE_DATE")

            url_app = url + "/projects/platform/" + pf + "/project/" + backup_project_id + "/app/" + value_app
            print(f"url_app :{url_app}")

            launch_restore()
            # time.sleep(2)
            message = f"app {value_app} restaurée à la date du {value_date}"
            return message, message, {'display': 'block'}, url_app
    return "", "", {'display': 'none'}, ""


########################################## filtre checkbox ##########################################
@callback(
    Output("apps_table", "dashGridOptions"),
    Input("input-filter", "value"),
)
def update_filter(filter_value):
    gridOptions_patch = Patch()
    gridOptions_patch["quickFilterText"] = filter_value
    print(f"maj filtre :{filter_value}")
    return gridOptions_patch


########################################## NOTIFICATION ##########################################
@callback(
    Output("action-return", "children", allow_duplicate=True),
    Output("notification", "style", allow_duplicate=True),

    Input(component_id='btn-close-notification', component_property='n_clicks'),
    prevent_initial_call=True
)
def hide_notification(n_clicks):
    message = ""
    display = {'display': 'none'}
    return message, display


########################################## LISTE DES APPS ##########################################
@callback(
    # Output("selected-app", "children"),
    # Output("apps_table", "selectedRows"),
    Output(component_id='submit-val', component_property="disabled"),

    Input(component_id='apps_table', component_property='selectedRows'),
    # Input(component_id='apps_table', component_property='rowData'),
)
def show_selected_app(selectedRows):
    patched_children = Patch()
    retour = True
    if len(selectedRows) > 0:
        retour = False

    return retour


########################################## BOUTON BACKUP ##########################################
@callback(
    Output("apps_table", "selectedRows"),
    # test ajout notification
    Output("action-return", "children", allow_duplicate=True),
    Output("notification", "style", allow_duplicate=True),

    Input(component_id='apps_table', component_property='selectedRows'),
    Input(component_id='apps_table', component_property='rowData'),
    Input(component_id='submit-val', component_property='n_clicks'),
    prevent_initial_call=True
)
def prepare_backup(selectedRows, rowData, n_clicks):
    patched_children = Patch()
    message_notification = ""
    # if n_clicks:
    if ctx.triggered_id == "submit-val":
        # The button has been clicked, values is a list containing the active checklist values
        # do something with values
        # return something 
        # - afficher la liste des apps qui seront backupées dans la div 'selected-app'
        # - mettre à jour la variable d'env BACKUP_LIST_APP_ID => comment trouver l'id du projet de l app courrante ?
        # - lancer le script script_backup/__main__.py
        # print(selectedRows)
        # print(rowData)
        list_selected_apps = []
        for row in selectedRows:
            list_selected_apps.append(row["app_id"])
        backup_list_app_id = ",".join(str(app_id) for app_id in list_selected_apps)
        if len(backup_list_app_id) > 0:
            #########################################################
            # maj de l'envvar en local
            print(f"local BACKUP_LIST_APP_ID avant maj : {os.environ['BACKUP_LIST_APP_ID']}")
            os.environ['BACKUP_LIST_APP_ID'] = backup_list_app_id
            test = os.environ['BACKUP_LIST_APP_ID']
            print(f"local BACKUP_LIST_APP_ID après maj : {test}")

            #########################################################
            # maj de l'envvar projet
            logging.info(f"----- Updating environment variables BACKUP_LIST_APP_ID...")
            logging.info(f"pf_id : {pf}")
            saagie.env_vars.create_or_update(
                scope="PROJECT",
                name="BACKUP_LIST_APP_ID",
                value=backup_list_app_id,
                description="List of apps to backup",
                # project_id=project_id
                project_id=backup_project_id
            )
            logging.info(f"----- Fin Updating environment variables BACKUP_LIST_APP_ID")

            launch_backup()
            # time.sleep(2)
            message_notification = 'The selected app(s) "{}" has(ve) been backuped '.format(backup_list_app_id)

            return [], message_notification, {'display': 'block'}
        message_notification = 'No app selected '
        return selectedRows, message_notification, {'display': 'none'}
    return selectedRows, message_notification, {'display': 'none'}


def launch_backup():
    logging.info(f"----- Lancement du script_backup ...")
    script_backup.script_backup()
    logging.info(f"----- Fin du script_backup ...")
    # return ""


def get_settings():
    return dmc.AccordionItem(
        [
            dmc.AccordionControl("Settings details"),
            dmc.AccordionPanel(
                children=[
                    html.Div(
                        className="sui-g-grid as--gutter-lg as--stretch",
                        children=[
                            html.Div(
                                className="sui-g-grid__item as--1_2@xs as--1_3@lg",
                                children=[
                                    html.Div(
                                        className="sui-a-label-value as--label-uppercase",
                                        children=[
                                            html.Div(
                                                className="sui-a-label-value__label",
                                                children=["Bucket URL"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[f"{endpoint_url}"],
                                            ),
                                        ],
                                    ),
                                ],

                            ),
                            html.Div(
                                className="sui-g-grid__item as--1_2@xs as--1_3@lg",
                                children=[
                                    html.Div(
                                        className="sui-a-label-value as--label-uppercase",
                                        children=[
                                            html.Div(
                                                className="sui-a-label-value__label",
                                                children=["Bucket Region"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[f"{region_name}"],
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                            html.Div(
                                className="sui-g-grid__item as--1_2@xs as--1_3@lg",
                                children=[
                                    html.Div(
                                        className="sui-a-label-value as--label-uppercase",
                                        children=[
                                            html.Div(
                                                className="sui-a-label-value__label",
                                                children=["Bucket Name"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[f"{s3_bucket_name}"],
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                            html.Div(
                                className="sui-g-grid__item as--1_2@xs as--1_3@lg",
                                children=[
                                    html.Div(
                                        className="sui-a-label-value as--label-uppercase",
                                        children=[
                                            html.Div(
                                                className="sui-a-label-value__label",
                                                children=["App Tempo Prefix"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[f"{app_prefix}"],
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                            html.Div(
                                className="sui-g-grid__item as--1_2@xs as--1_3@lg",
                                children=[
                                    html.Div(
                                        className="sui-a-label-value as--label-uppercase",
                                        children=[
                                            html.Div(
                                                className="sui-a-label-value__label",
                                                children=["ID projet backup"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[f"{backup_project_id}"],
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                            html.Div(
                                className="sui-g-grid__item as--1_2@xs as--1_3@lg",
                                children=[
                                    html.Div(
                                        className="sui-a-label-value as--label-uppercase",
                                        children=[
                                            html.Div(
                                                className="sui-a-label-value__label",
                                                children=["Nom projet backup"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[f"{info_projet_backup['name']}"],
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                            html.Div(
                                className="sui-g-grid__item as--1_2@xs as--1_3@lg",
                                children=[
                                    html.Div(
                                        className="sui-a-label-value as--label-uppercase",
                                        children=[
                                            html.Div(
                                                className="sui-a-label-value__label",
                                                children=["url plateforme"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[f"{url}"],
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                            html.Div(
                                className="sui-g-grid__item as--1_2@xs as--1_3@lg",
                                children=[
                                    html.Div(
                                        className="sui-a-label-value as--label-uppercase",
                                        children=[
                                            html.Div(
                                                className="sui-a-label-value__label",
                                                children=["ID plateforme"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[f"{pf}"],
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                            html.Div(
                                className="sui-g-grid__item as--1_2@xs as--1_3@lg",
                                children=[
                                    html.Div(
                                        className="sui-a-label-value as--label-uppercase",
                                        children=[
                                            html.Div(
                                                className="sui-a-label-value__label",
                                                children=["user backup"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[f"{platformLogin}"],
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                        ]
                    ),
                ]
            ),
        ],
        value="settings",
    ),


def launch_restore():
    logging.info(f"----- Lancement du script_restore ...")
    script_restore.script_restore()
    logging.info(f"----- Fin du script_restore ...")


if __name__ == "__main__":
    # PROD
    # app.run_server(host="0.0.0.0", debug=False, port=8050)
    # DEV
    app.run_server(host="0.0.0.0", debug=True, port=8050)
