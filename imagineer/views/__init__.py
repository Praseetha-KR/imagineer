from flask import Flask, render_template, jsonify, request, flash, redirect
from imagineer import app, mongo
from imagineer.models import BlogPost
import re
from unidecode import unidecode

_punct_re = re.compile(r'[\t !"#$%&\'()*\-/<=>?@\[\\\]^_`{|},.]+')

def slugify(text, delim=u'-'):
    result = []
    for word in _punct_re.split(text.lower()):
        result.extend(unidecode(word).split())
    return unicode(delim.join(result))

@app.route('/')
def index():	
	posts = mongo.db.blogCollection.find()
	return render_template('index.html', posts=posts)

@app.route('/new/', methods=['GET', 'POST'])
def new():
	form = BlogPost(request.form)
	if request.method == 'POST' and form.validate():
		form.slug.data = slugify(form.title.data)
		mongo.db.blogCollection.insert(form.data)
		flash('Post saved.')
		redirect('index')
	return render_template('new.html', form=form)

@app.route('/post/<slug>/')
def post_view(slug):
	post = mongo.db.blogCollection.find_one_or_404({'slug':slug})
	return render_template('post_view.html', post=post)

