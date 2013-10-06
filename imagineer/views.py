from flask import Blueprint, request, redirect, render_template, url_for
from flask.views import MethodView

from flask.ext.mongoengine.wtf import model_form
from imagineer.models import Post, Comment
from imagineer import app

posts = Blueprint('posts', __name__, static_folder='static', static_url_path='/_imagineer', template_folder='templates')


class ListView(MethodView):

    def get(self):
        posts = Post.objects.all()
        return render_template('posts/list.html', posts=posts)


class DetailView(MethodView):

    form = model_form(Comment, exclude=['created_at'])

    def get_context(self, slug):
        post = Post.objects.get_or_404(slug=slug)
        form = self.form(request.form)

        context = {
            "post": post,
            "form": form
        }
        return context

    def get(self, slug):
        context = self.get_context(slug)
        return render_template('posts/detail.html', **context)

    def post(self, slug):
        context = self.get_context(slug)
        form = context.get('form')

        if form.validate():
            comment = Comment()
            form.populate_obj(comment)

            post = context.get('post')
            post.comments.append(comment)
            post.save()

            return redirect(url_for('posts.detail', slug=slug))
        return render_template('posts/detail.html', **context)


# Register the urls
posts.add_url_rule('/', view_func=ListView.as_view('list'))
posts.add_url_rule('/blog/<slug>/', view_func=DetailView.as_view('detail'))

@app.route('/about/')
def about():
    return render_template('about.html')

@app.route('/resume/')
def resume():
    return render_template('resume.html')

@app.route('/experiments/css/')
def experiments_css():
    return render_template('experiments/css.html')

@app.route('/experiments/js/')
def experiments_js():
    return render_template('experiments/js.html')

@app.route('/experiments/art/')
def experiments_art():
    return render_template('experiments/art.html')

@app.route('/experiments/craft/')
def experiments_craft():
    return render_template('experiments/craft.html')

@app.route('/experiments/photography/')
@app.route('/experiments/photography/travel/1/')
def experiments_photography_travel_1():
    return render_template('experiments/photography/travel/1.html')

@app.route('/experiments/photography/nature/1/')
def experiments_photography_nature_1():
    return render_template('experiments/photography/nature/1.html')
