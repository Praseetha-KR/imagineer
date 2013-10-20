from flask import Flask, render_template
from imagineer import app

@app.route('/')
def hello():
	return render_template('index.html')