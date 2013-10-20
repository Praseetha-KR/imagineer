from flask import Flask

app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('settings.py')

import imagineer.views
import imagineer.models