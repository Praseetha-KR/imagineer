from flask import render_template
from .. import app

@app.route('/')
@app.route('/<name>')
def hello(name=None):
	return render_template('index.html', name=name)