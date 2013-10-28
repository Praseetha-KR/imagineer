from flask import Flask, render_template, request, flash, redirect, url_for, session, abort
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
	if not session.get('logged_in'):
		abort(401)
	form = BlogPost(request.form)
	if request.method == 'POST' and form.validate():
		form.slug.data = slugify((form.created_at.data.strftime("%Y %m %d"))+"-"+form.title.data)
		mongo.db.blogCollection.insert(form.data)
		flash('Post saved.')
		redirect(url_for('index'))
	return render_template('new.html', form=form)

@app.route('/post/<slug>/')
def post_view(slug):
	post = mongo.db.blogCollection.find_one_or_404({'slug':slug})
	return render_template('post_view.html', post=post)

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('index'))
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('index'))
