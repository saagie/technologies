import os

from url_fixer import UrlFixer

prefix: str = os.environ["SAAGIE_BASE_PATH"].replace("/", "", 1)
# keyword - replacement - useQuotes
replacementsEverywhere: list = [
    ("static", prefix),  # js and css files
    ("api/v1", prefix),  # superset APIs
    ("superset", prefix),  # menu plus sign
    ("chart", prefix),  # menu plus sign and menu Chart
    ("dashboard", prefix),  # menu plus sign and menu Dashboard
    ("user", prefix),  # menu Settings
    ("roles", prefix),  # menu Settings
    ("logmodelview", prefix),  # menu Settings
    ("annotationlayermodelview", prefix),  # menu Settings
    ("csstemplatemodelview", prefix),  # menu Settings
    ("dynamic-plugins", prefix),  # menu Settings
    ("databaseview", prefix),  # menu Data
    ("tablemodelview", prefix),  # menu Data
    ("csvtodatabaseview", prefix),  # menu Data
    ("exceltodatabaseview", prefix),  # menu Data
    ("savedqueryview", prefix),  # menu SQL Lab
    ("csstemplateasyncmodelview", prefix)  # when creating a new dashboard
]


replacementsInPython: list = [
    ('label=__("Databases"),', f'label=__("Databases"), href="/{prefix}/databaseview/list/",'),
    ('label=__("Annotation Layers"),',
     f'label=__("Annotation Layers"), href="/{prefix}/annotationlayermodelview/list/",'),
    ('label=__("Charts"),', f'label=__("Charts"), href="/{prefix}/chart/list/",'),
    ('label=__("Dashboards"),', f'label=__("Dashboards"), href="/{prefix}/dashboard/list/",'),
    ('label=__("Plugins"),', f'label=__("Plugins"), href="/{prefix}/dynamic-plugins/list/",'),
    ('label=__("CSS Templates"),', f'label=__("CSS Templates"), href="/{prefix}/csstemplatemodelview/list/",'),
    ('label=__("Row level security"),',
     f'label=__("Row level security"), href="/{prefix}/rowlevelsecurityfiltersmodelview/list/",'),
    ('label=__("Action Log"),', f'label=__("Action Log"), href="/{prefix}/logmodelview/list/",'),
    ('LOGO_TARGET_PATH = None', 'LOGO_TARGET_PATH = "/' + prefix + '"')
]

replacementsInJavascript: list = [
    ("datasource", prefix),
    ("savedqueryviewapi", prefix),
    ("annotationmodelview", prefix),
    ("dashboardasync", prefix),
    ("sliceasync", prefix),
    ("tableschemaview", prefix),
    ("tabstateview", prefix)
]
simpleReplacementsInJavascript: list = [
    ('window.location.pathname.split("/")[3]', 'window.location.pathname.split("/")[4]'),
    ('${window.location.origin}/superset/', '${window.location.origin}/' + prefix + '/superset/'),
    ('api/v1/explore/form_data', prefix + 'api/v1/explore/form_data'),
    ('`api/v1/dashboard', '`' + prefix + 'api/v1/dashboard')
]

simpleReplacementsInCss: list = [
    ('url(/static/', 'url(/' + prefix + '/static/')
]

simpleReplacementsInHtml: list = [
    ('{{ assets_prefix }}', "/" + prefix)
]

BASE_DIR = "/app/superset/"
ASSET_DIR = f"{BASE_DIR}static/assets/"
TEMPLATES_DIR = f"{BASE_DIR}templates/"

urlFixer: UrlFixer = UrlFixer()
print('smart_replace - replacementsEverywhere - ASSET_DIR - .js')
urlFixer.smart_replace(replacementsEverywhere, ASSET_DIR, ".js")
print('smart_replace - replacementsInJavascript - ASSET_DIR - .js')
urlFixer.smart_replace(replacementsInJavascript, ASSET_DIR, ".js")
print('simple_replace - simpleReplacementsInJavascript - ASSET_DIR - .js')
urlFixer.simple_replace(simpleReplacementsInJavascript, ASSET_DIR, ".js")

print('smart_replace - replacementsEverywhere - ASSET_DIR - .js.map')
urlFixer.smart_replace(replacementsEverywhere, ASSET_DIR, ".js.map")
print('smart_replace - replacementsInJavascript - ASSET_DIR - .js.map')
urlFixer.smart_replace(replacementsInJavascript, ASSET_DIR, ".js.map")

print('smart_replace - replacementsEverywhere - ASSET_DIR - .css')
urlFixer.smart_replace(replacementsEverywhere, ASSET_DIR, ".css")
print('simple_replace - simpleReplacementsInCss - ASSET_DIR - .css')
urlFixer.simple_replace(simpleReplacementsInCss, ASSET_DIR, ".css")

print('smart_replace - replacementsEverywhere - ASSET_DIR - .json')
urlFixer.smart_replace(replacementsEverywhere, ASSET_DIR, ".json")

print('smart_replace - replacementsEverywhere - TEMPLATES_DIR - .html')
urlFixer.smart_replace(replacementsEverywhere, TEMPLATES_DIR, ".html")
print('simple_replace - simpleReplacementsInHtml - TEMPLATES_DIR - .html')
urlFixer.simple_replace(simpleReplacementsInHtml, TEMPLATES_DIR, ".html")

print('smart_replace - replacementsEverywhere - BASE_DIR - .py')
urlFixer.smart_replace(replacementsEverywhere, BASE_DIR, ".py")
print('simple_replace - replacementsInPython - BASE_DIR - .py')
urlFixer.simple_replace(replacementsInPython, BASE_DIR, ".py")
