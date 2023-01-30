import os
import logging

# Prevents workers from trying to initialize database and permissions (might lead to race conditions)
os.environ["SUPERSET_UPDATE_PERMS"] = "false"

LOG_FORMAT = '[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s'
LOG_LEVEL = 'INFO'

flask_logger = logging.getLogger('flask_caching')
flask_logger.setLevel(logging.INFO)

CACHE_CONFIG = {
    'CACHE_TYPE': 'FileSystemCache',
    'CACHE_DIR': '/tmp/cache',
    'CACHE_DEFAULT_TIMEOUT': 3600,
}

DATA_CACHE_CONFIG = {
    'CACHE_TYPE': 'FileSystemCache',
    'CACHE_DIR': '/tmp/data-cache',
    'CACHE_DEFAULT_TIMEOUT': 3600,
}


class ReverseProxied(object):

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_SCRIPT_NAME', '')
        if script_name:
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]

        scheme = environ.get('HTTP_X_SCHEME', '')
        if scheme:
            environ['wsgi.url_scheme'] = scheme
        return self.app(environ, start_response)


ADDITIONAL_MIDDLEWARE = [ReverseProxied, ]
