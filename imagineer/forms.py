import datetime
from flask.ext.wtf import Form 
from wtforms import TextField, TextAreaField, SubmitField, DateTimeField
from wtforms.validators import Required

class BlogPost(Form):
	created_at = DateTimeField(default=datetime.datetime.now, required=True) 
	title = TextField("title")
	content = TextAreaField("content")
	slug = TextField("slug")	
	submit = SubmitField("save")
