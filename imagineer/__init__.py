from flask import Flask
from flask.ext.pymongo import PyMongo

app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('settings.py')
mongo = PyMongo(app, config_prefix='MONGO')
app.secret_key = 'development key'

import imagineer.views
import imagineer.models