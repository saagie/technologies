# Dash - customized by Saagie

Dash app example on Saagie
To run Dash on Saagie :

Use image saagie/dash:0.3
Open port 8050, use SAAGIE_BASE_PATH as BASE PATH VAR and let check rewrite url box.

app.py in Dash app should have host set to 0.0.0.0
and should define a request-pathname-prefix = SAAGIE_BASE_PATH

```
app.config.update({
    # as the proxy server will remove the prefix
    'routes_pathname_prefix': '/', 

    # the front-end will prefix this string to the requests
    # that are made to the proxy server
    'requests_pathname_prefix': 'SAAGIE_BASE_PATH/'
})
app.run_server(debug=True, host='0.0.0.0')
```