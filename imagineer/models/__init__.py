import datetime
from flask import Flask, url_for
from imagineer import mongo

from wtforms import Form, DateTimeField, TextField, TextAreaField, SubmitField, validators


class BlogPost(Form):
	created_at = DateTimeField(default=datetime.datetime.now) 
	title = TextField("title")
	content = TextAreaField("content")
	slug = TextField("slug")	
	submit = SubmitField("save")

	def get_absolute_url(self):
		return url_for('post', kwargs={'slug': self.slug})

		
