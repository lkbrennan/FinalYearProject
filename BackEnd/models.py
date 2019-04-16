from server import db
from sqlalchemy.dialects.postgresql import JSON

#SQL Alchemy model classes
#they correspond to the database tables and are used for Python inserts, queries and delete statments on the database

class User(db.Model):
	__tablename__ = 'user_account'

	user_id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(), unique=True, nullable=False)
	email = db.Column(db.String(),unique=True, nullable=False)
	type = db.Column(db.String(), nullable=False)
	password = db.Column(db.String(), nullable=False)

	def __init__(self, username, email, type, password):
		self.username = username
		self.email = email
		self.type = type
		self.password = password

	def __repr__(self):
		return '<user {}>'.format(self.username)
		
class Classes(db.Model):
	__tablename__ = 'classlist'
	
	class_id = db.Column(db.Integer, primary_key=True)
	class_name = db.Column(db.String(), unique=True, nullable=False)
	class_password = db.Column(db.String(), nullable=False)
	
	def __init__(self, class_name, class_password, class_teacher):
		self.class_name = class_name
		self.class_password = class_password
	
	def __repr__(self):
		return '<class {}>'.format(self.class_name)
	
	
class HasClass(db.Model):
	__tablename__ = 'has_class'
	
	has_class_id = db.Column(db.Integer, primary_key=True)
	class_id = db.Column(db.Integer, nullable=False)
	user_id = db.Column(db.Integer, nullable=False)
	
	def __init__(self, class_id, user_id):
		self.class_id = class_id
		self.user_id = user_id
	
	def __repr__(self):
		return '<hasclass {}>'.format(self.user_id)
		
class Quiz(db.Model):
	__tablename__ = "quiz"
	
	quiz_name= db.Column(db.String(), primary_key=True)
	quiz_corrected = db.Column(db.Boolean)
	quiz_date = db.Column(db.Date)
	
	def __init__(self, quiz_name,quiz_corrected,quiz_date):
		self.quiz_name = quiz_name
		self.quiz_corrected = quiz_corrected
		self.quiz_date = quiz_date
	
	def __repr__(self):
		return '<quiz {}>'.format(self.quiz_id)
		
class HasQuiz(db.Model):
	__tablename__ = "has_quiz"
	
	has_quiz_id = db.Column(db.Integer, primary_key=True)
	quiz_name = db.Column(db.String(), nullable=False)
	user_id = db.Column(db.Integer, nullable=False)

	def __init__(self, quiz_name, user_id):
		self.quiz_name = quiz_name
		self.user_id = user_id
	
	def __repr__(self):
		return '<quiz {}>'.format(self.quiz_name)
		
class Question(db.Model):
	__tablename__ = "questions"
	
	question_id = db.Column(db.Integer, primary_key=True)
	question_num = db.Column(db.Integer,nullable=False)
	quiz_name = db.Column(db.String(), nullable=False)
	question_sum = db.Column(db.String(), nullable=False)
	question_answer = db.Column(db.String(), nullable=False)
	question_operator = db.Column(db.String(), nullable=False)
	
	def __init__(self, question_num, quiz_name, question_sum, question_answer, question_operator):
		self.question_num = question_num
		self.quiz_name = quiz_name
		self.question_sum = question_sum
		self.question_answer = question_answer
		self.question_operator = question_operator
	
	def __repr__(self):
		return '<question {}>'.format(self.question_id)
		
class StudentAnswer(db.Model):
	__tablename__ = "studentanswer"
	
	answer_id = db.Column(db.Integer, primary_key=True)
	question_id = db.Column(db.Integer, nullable=False)
	file_path = db.Column(db.String(), unique=True)
	student_answer = db.Column(db.String())
	
	def __init__(self, question_id, file_path, student_answer):
		self.question_id = question_id
		self.file_path = file_path
		self.student_answer = student_answer
	
	def __repr__(self):
		return '<answer {}>'.format(self.answer_id)