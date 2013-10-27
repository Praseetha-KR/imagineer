import datetime
from flask import Flask, url_for
from imagineer import mongo
from wtforms import Form, Field, DateTimeField, TextField, TextAreaField, SubmitField, validators

class TagListField(Field):
	widget = TextField()

	def _value(self):
		if self.data:
			return u', '.join(self.data)
		else:
			return u''

	def process_formdata(self, valuelist):
		if valuelist:
			self.data = [x.strip() for x in valuelist[0].split(',')]
		else:
			self.data = []

class BlogPost(Form):
	created_at = DateTimeField(default=datetime.datetime.now) 
	title = TextField("title")
	content = TextAreaField("content")
	slug = TextField("slug")	
	tags = TagListField("tags")
	submit = SubmitField("save")

