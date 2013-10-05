from flask import Flask
# create our little application :)
app = Flask(__name__)

from . import models, views