from dash import html, dcc, ctx
import dash_loading_spinners as dls
import dash_mantine_components as dmc
import dash_ag_grid as dag

from tools.tools import *
from configs import *

def get_body_app():
    return dmc.MantineProvider(
        children=[
            html.Div(id="sui-root", children=[
                html.Div(
                    id="header",
                    style={'backgroundColor': '#1F3046'},
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
                                html.Span("AddOn Backup/Restore", className="sui-h-text-lg sui-h-text-white")
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
                            children=[
                                # div contenu des onglets
                                html.Div(id='tabs-content', className="sui-l-layout__page"),
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
                                                html.A(id='app-link', target="_blank", title="See app",
                                                    children="Go to the app"),
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

def render_tabs(tab, list_paths_backup):
    list_max_dates_backup = get_list_max_dates_backup(list_paths_backup)
    if tab == 'tab-backup':
        return tab_backup(list_max_dates_backup)
    elif tab == 'tab-restore':
        return tab_restore(list_paths_backup)


# ______ BACKUP TAB ________________________
columnDefsBackUp = [
    {
        "field": "projet",
        "headerName": "Project Name",
        "checkboxSelection": True,
        "headerCheckboxSelection": True,
        "headerCheckboxSelectionFilteredOnly": True,
    },
    {
        "field": "project_id",
        "headerName": "Project ID",
    },
    {
        "field": "app_name",
        "headerName": "App Name",     
    },
    {
        "field": "app_id",
        "headerName": "App ID",
    },
    {
        "field": "last_backup",
        "headerName": "Date of last backup",
    },
    {
        "field": "app_url",
        "headerName": "App url",
        "cellRenderer": "StockLink",
    }
]

def tab_backup(list_max_dates_backup):
    dataProjects = list_projects(saagie, list_max_dates_backup, url, pf).to_dict('records')
    
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
                                                dcc.Input(id="input-filter", value="", 
                                                        placeholder="Filter by name, id... and press Enter",
                                                        debounce=True,
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
                html.Div(children=[
                    html.Div(children=[
                        dag.AgGrid(
                            id="apps_table",
                            columnDefs=columnDefsBackUp,
                            rowData=dataProjects,
                            columnSize="sizeToFit",
                            selectedRows=[],
                            defaultColDef={
                                "sortable": False,
                            },
                            dashGridOptions={
                                "rowMultiSelectWithClick": True,
                                "rowSelection": "multiple",
                                "animateRows": False,
                                'pagination': True,
                                'paginationPageSize': 10,
                                'quickFilterText': "",
                                "paginationPageSizeSelector": False
                            },
                        ),
                    ]),
                ]),
            ]),
        ])

# ______ RESTORE TAB ________________________
def tab_restore(list_paths_backup):
    backups_list = get_select_data(saagie, list_path_to_dict(list_paths_backup))

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
                                                data=backups_list,
                                                searchable=True,
                                                clearable=True,
                                                label="Available backups",
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
                                                label="Backup dates",
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

                            dmc.Text(id="info-restore"),
                        ]
                    ),
                ]
            ),
        ])

def get_settings():
    if info_projet_backup == None:
        info_projet_backup_name = "None"
    else:
       info_projet_backup_name = f"{info_projet_backup['name']}"

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
                                                children=["Sub-apps prefix"],
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
                                                children=["Project ID app backup"],
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
                                                children=["Project's name backup"],
                                            ),
                                            html.Div(
                                                className="sui-a-label-value__value",
                                                children=[info_projet_backup_name],
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
                                                children=["Platform URL"],
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
                                                children=["Platform ID"],
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