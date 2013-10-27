from flask import Flask, render_template, jsonify, request, flash, redirect
from imagineer import app, mongo
from imagineer.models import BlogPost

@app.route('/')
def index():	
	posts = mongo.db.blogCollection.find()
	return render_template('index.html', posts=posts)

@app.route('/new', methods=['GET', 'POST'])
def new():
	form = BlogPost(request.form)
	if request.method == 'POST' and form.validate():
		mongo.db.blogCollection.insert(form.data)
		flash('Post saved.')
		redirect('index')
	return render_template('new.html', form=form)

@app.route('/<slug>')
def post_view(self, slug):
	post = BlogPost.objects.get_or_404(slug=slug)
	return render_template('post_view.html', post=post)

