import google.cloud
from google.cloud import vision
from google.cloud.vision import types
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from flask import Flask, request, send_file
from flask import jsonify
from src.quiz import quiz
import json
import io
import os
import uuid
from datetime import datetime

app = Flask(__name__)

#setting the database URL so it can be contacted for queries
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://laurenkb:masterPasswordlkb@fyp-db-instance.cvtxhyimq0r8.eu-west-1.rds.amazonaws.com:5432/fypdb'
db = SQLAlchemy(app)

#importing Database models from SQL alchemy moedls.py script
from models import User, Quiz, Classes, HasClass, Question, StudentAnswer, HasQuiz


#URL that posts the students answers to the server
#images get saved to file on server
#file corresponds to the students username and the quizname
#this file name is then posted to the database
@app.route('/postImageQuestions', methods=['POST'])
def postImageQuestions():	
	imageFile = request.files["my_photo"]
	
	userName = request.form["username"]
	quizName = request.form["quizname"]
	filename = request.form["filename"]
	qnum = int(filename)
	
	print(quizName)
	
	dirName = 'quizimages/' + userName + '/'
	
	# Create STUDENT target directory if it doesn't exist
	if not os.path.exists(dirName):
		os.mkdir(dirName)
		print("Directory " , dirName ,  " Created ")
	else:    
		print("Directory " , dirName ,  " already exists")

	# Create QUIZ target directory if it doesn't exist
	if not os.path.exists(dirName + quizName + '/'):
		os.mkdir(dirName + quizName + '/')
		imageFile.save(dirName + quizName + '/' + filename + '.png')
	else:    
		imageFile.save(dirName + quizName + '/' + filename + '.png')
		
	#save full file path to be posted to server
	fullFilePath = dirName + quizName + '/' + filename + '.png'
	
	#query database for Question that corresponds to students answer
	studentanswer = Question.query.filter_by(quiz_name=quizName).filter_by(question_num=qnum).first()

	#save questionID
	qid = studentanswer.question_id
	
	#as the student doesnt have an answer to submit yet
	#answer is set as none until a teacher can correct it
	answer = None 
	
	#create new student answer instance on the DB
	new_studentAnswer = StudentAnswer(qid, fullFilePath, answer)
	db.session.add(new_studentAnswer)
	db.session.commit()

	return jsonify(
		message = "hello"
	)

	
#URL to post inputted questions to
@app.route('/postQuestions',methods=['POST'])
def postQuestions():
	content = request.get_json(silent=True)

	print(content)
	username = content['username']
	quizname = content['quizname']
	answer = content['answer']
	q_num = content['qnum']
	
	#filepath is set to none as there is no image file to set the file oath to
	filePath = None
	studentanswer = Question.query.filter_by(quiz_name=quizname).filter_by(question_num=q_num).first()

	#save questionID
	qid = studentanswer.question_id
		
	new_studentAnswer = StudentAnswer(qid, filePath, answer)
	db.session.add(new_studentAnswer)
	db.session.commit()

	return jsonify(
		message = "hello"
	)

	
#URL that creates quiz object and returns to client
#also creates new quiz instance in the DB with corresponding questions
@app.route('/quiz', methods=['POST'])
def getQuiz():
	#get requested level and question amount from client
	#get client generated uuid for quiz name
	content = request.get_json(silent=True)
	max = content['maxNumber']
	qnum = content['number']
	typeInclude = content['typeInclude']
	quizName = content['quizname']
	date = content['currentDate']
	quiztype = content['quizType']
	userName = content['username']

	
	if quiztype == "handwritten":
		corrected = False
	if quiztype == "inputonly":
		corrected = True
	
	#create new quiz instance on the server
	new_quiz = Quiz(quizName, corrected, date)
	db.session.add(new_quiz)
	db.session.commit()
		
	#run quiz script to create quiz for client
	q = quiz(max,qnum, typeInclude)
	questions = q.run()
	
	#get user id
	user = User.query.filter_by(username=userName).first()
	userId = user.user_id
	
	#create new has_quiz instance between quiz and user
	new_hasQuiz = HasQuiz(quizName,userId)
	db.session.add(new_hasQuiz)
	db.session.commit()
	
	#creating question instances on the DB
	#each question corresponds to a quiz
	for i in range(len(questions)):
		sum = questions[i]["sumline"]
		answer = questions[i]["answer"]
		operator = questions[i]["operator"]
		
		new_question = Question(i+1, quizName, sum, answer, operator)
		db.session.add(new_question)
		db.session.commit()
		
	#turn question list to JSON object and return it to the client
	jsonq = json.dumps(questions)
	return jsonq
	
	
#URL that takes clients login details
@app.route('/login', methods=['POST'])
def loginCheck():
	#get clients email and password
	content = request.get_json(silent=True)
	u_email = content['email']
	pw = content['pw']
	
	#query for that user on the database
	user = User.query.filter_by(email=u_email).first()
	
	#if user doesnt exist, return error
	if user is None:
		return jsonify(
			message = "user does not exist"
		)
	#else, llog user into account and send them back their user details
	#user details will be saved to client device using AsyncStorage
	#and used for other requests
	else:
		if user.password == pw:
			accounttype = user.type
			accountname = user.username
			accountemail = user.email
			accountpw = user.password
			print(accounttype + accountname + accountemail + accountpw)
			return jsonify(
				message = "logged in",
				utype = accounttype,
				uname = accountname,
				uemail = accountemail,
				upassword = accountpw
			)
		else:
			return jsonify(
				message = "incorrect password"
			)

			
#URL for user account creation/signup 
@app.route('/signup', methods=['POST'])
def signup():
	#get new users account information
	content = request.get_json(silent=True)
	username = content['username']
	email = content['email']
	password = content['pw']
	type = content['account']
	
	#try to create a new instance on the DB for this user
	try:
		new_user = User(username, email, type, password)
		db.session.add(new_user)
		db.session.commit()
		return jsonify(
			message = "signed up"
		)
	#returns integrity error if user already exists
	#catches error and sends message back to user
	except IntegrityError as e:
		return jsonify(
			message = "error caught"
		)
		
		
#URL to update account
@app.route('/accountUpdate', methods=['POST'])
def accountUpdate():
	#get users updated info
	content = request.get_json(silent=True)
	
	userEmail = content['email']
	userName = content['username']
	userPw = content['password']
	
	#query db for user and update user fields
	user = User.query.filter_by(username=userName).first()
	user.email = userEmail
	user.password = userPw
	db.session.commit()
		
	return jsonify(
		message = 'Account successfully updated'
	)
		
		
#URL to delete user account
@app.route('/accountDelete', methods=['POST'])
def accountDelete():
	#get users username
	content = request.get_json(silent=True)
	
	userName = content['username']
	
	#query database for user 
	user = User.query.filter_by(username=userName).first()
	
	#delete user from database
	db.session.delete(user)
	db.session.commit()
	
	return jsonify(
		message = "Account successfully deleted"
	)

	
#URL to get the classlist for a given user
@app.route('/classList', methods=['POST'])
def getClass():
	#get username
	content = request.get_json(silent=True)
	
	userName = content['username']
	
	#query DB for user and get their user_id
	user = User.query.filter_by(username=userName).first()
	userId = user.user_id

	#query DB table has_class - holds user_id and class_id
	#return all matches
	hasclass = HasClass.query.filter_by(user_id=userId).all()
	
	classlist = {}
	
	if len(hasclass)==0:
		jsonclass = json.dumps(classlist)
		return jsonclass
	
	else:
		#for all instances that the user appeared in the has_class table
		for i in range(len(hasclass)):
			classId = hasclass[i].class_id
			classTaken = Classes.query.filter_by(class_id=classId).first()
			className = classTaken.class_name
			classlist[i] = {}
			classlist[i]["classname"] = className
			classlist[i]["id"] = i
		
		jsonclass = json.dumps(classlist)
		
		print(jsonclass)
		return jsonclass

	
#URL to add a student to a class or let a teacher create a class
#Checks if the user is a student or a teacher 
#If they are a student, they are added to a class that already exists 
#using the class name and password 
#If they are a teacher, a new class is created under their name
@app.route('/addClass',methods=['POST'])
def addClass():
	content = request.get_json(silent=True)
	
	type = content['usertype']
	
	if type == "student" :
		userName = content['username']
		className = content['classname']
		classPw = content['classpassword']
		
		user = User.query.filter_by(username=userName).first()
		userId = user.user_id
		
		classExist = Classes.query.filter_by(class_name=className).first()
		
		#check is classexists
		try:
			if classExist == None:
				return jsonify(
					message="Class does not exist"
				)
			else:
				classExistPw = classExist.class_password
				
				if classExistPw == classPw :
					classExistId = classExist.class_id
					
					new_hasClass = HasClass(classExistId, userId)
					db.session.add(new_hasClass)
					db.session.commit()
					
					return jsonify(
						message= "Class Added"
					)
					
				else :
					return jsonify(
						message= "Incorrect Password"
					)
		#sqlalchemy will return an integrity error if the class does not exist in the db
		except IntegrityError as e:
			return jsonify (
				message = "Class does not exist"
			)
		
	if type == "teacher":
		userName = content['username']
		className = content['classname']
		classPw = content['classpassword']
		
		user = User.query.filter_by(username=userName).first()
		userId = user.user_id

		#check is classexists and if it doesnt, add it to the db
		try:
			newClass = Classes(className,classPw, None)
			db.session.add(newClass)
			db.session.commit()
			
			classExist = Classes.query.filter_by(class_name=className).first()
			classExistId = classExist.class_id
			
			new_hasClass = HasClass(classExistId,userId)
			db.session.add(new_hasClass)
			db.session.commit()
			
			return jsonify(
				message= "Class Added"
			)
		#sqlalchemy will return an integrity error if the class exists in the db
		except IntegrityError as e:
			return jsonify(
				message = "Class exists"
			)

	
#URL to allow student to leave class or teacher to delete the class entirely
#Checks if the user is a student or a teacher. 
#If they are a student, they are removed from the chosen class. 
#If they are a teacher, the chosen class is removed entirely from the database system.	
@app.route('/deleteClass',methods=['POST'])
def deleteClass():
	content = request.get_json(silent=True)
	
	userType = content['usertype']
	className = content['classname']
	userName = content['username']
	
	if userType == "student":
		classes = Classes.query.filter_by(class_name=className).first()
		classId = classes.class_id
		
		user = User.query.filter_by(username=userName).first()
		userId = user_id
		
		check_hasClass = HasClass.query.filter_by(user_id=userId).filter_by(class_id=classId).first()
		
		db.session.delete(check_hasClass)
		db.commit()
		
		return jsonify(
			message = "You have successfully left this class"
		)
		
	if userType == "teacher":
		#query database for class 
		classes = Classes.query.filter_by(class_name=className).first()
		
		#delete class from database
		db.session.delete(classes)
		db.session.commit()
		
		return jsonify(
			message = "Class successfully deleted"
		)
	
	
#URL to return list of students for a given class
@app.route('/studentList', methods=['POST'])
def getStudentList():
	#get username
	content = request.get_json(silent=True)
	
	className = content['classname']
	
	#query DB for user and get their user_id
	classes = Classes.query.filter_by(class_name=className).first()
	classId = classes.class_id

	#query DB table has_class - holds user_id and class_id
	#return all matches
	hasclass = HasClass.query.filter_by(class_id=classId).all()
	
	print(hasclass)
	
	studentlist = {}
	
	#for all instances that the user appeared in the has_class table
	for i in range(len(hasclass)):
		studentId = hasclass[i].user_id
		student = User.query.filter_by(user_id=studentId).first()
		studentName = student.username
		studentlist[i] = {}
		studentlist[i]["studentname"] = studentName
		studentlist[i]["id"] = i
	
	jsonclass = json.dumps(studentlist)
	
#	print(jsonclass)
	return jsonclass

	
#URL to remove a student from a given class
@app.route('/removeStudent',methods=['POST'])
def removeStudents():
	content = request.get_json(silent=True)
	
	studentName = content['studentname']
	className = content['classname']
	
	classes = Classes.query.filter_by(class_name=className).first()
	classId = classes.class_id
	
	student = User.query.filter_by(username=studentName).first()
	studentId = student.user_id
	
	check_hasClass = HasClass.query.filter_by(user_id=studentId).filter_by(class_id=classId).first()
	
	db.session.delete(check_hasClass)
	db.session.commit()
	
	return jsonify(
		message = "Student has been successfully removed from this class"
	)

#URL to get scores for a given student
@app.route('/getScores',methods=['POST'])	
def viewScores():
	content = request.get_json(silent=True)
	
	studentName = content['studentname']
	
	getUser = User.query.filter_by(username=studentName).first()
	userId = getUser.user_id

	getQuestions = Question.query.filter_by(quiz_name=quizName).all()

	correctAnswerCount = 0
	numQuestions = 0

	#dictionary to show the original number of questions for each operator
	#vs the number of correct answers for each operator
	#Used to show what areas student is lacking in
	
	resultsList = {}
	
	originalList = {
		'x':0,
		'/':0,
		'+':0,
		'-':0
	}
	
	correctList = {
		'x':0,
		'/':0,
		'+':0,
		'-':0	
	}

	#go through array of questions and compare student answer to correct answer
	for x in range(len(getQuestions)):
		numQuestions = numQuestions + 1

		getQuestionId = getQuestions[x].question_id
		getQuestionOp = getQuestions[x].question_operator
		originalList[getQuestionOp] = originalList[getQuestionOp] + 1
		getQuestionAnswer = getQuestions[x].question_answer
	
		getStudentAnswers = StudentAnswer.query.filter_by(question_id=getQuestionId).first()
		student_answer = getStudentAnswers.student_answer
		
		if student_answer == getQuestionAnswer:
			correctList[getQuestionOp] = correctList[getQuestionOp] + 1
			print(correctList[getQuestionOp])
			correctAnswerCount = correctAnswerCount + 1

	finalScores = {
		'correct':correctAnswerCount,
		'overall':numQuestions
	}

	resultsList['original'] = originalList
	resultsList['correct'] = correctList
	resultsList['final'] = finalScores
	
	jsonResultsList = json.dumps(resultsList)

	print(jsonResultsList)
	
	return jsonResultsList

	
#get list of quizzes for a given student
@app.route('/quizList',methods=['POST'])
def getQuizList():
	content = request.get_json(silent=True)

	studentName = content['studentname']
	student = User.query.filter_by(username=studentName).first()
	studentId = student.user_id

	check_hasQuiz = HasQuiz.query.filter_by(user_id=studentId).all()

	print(check_hasQuiz)
	
	quizlist = {}

	#for all instances that the user appeared in the has_quiz table
	for i in range(len(check_hasQuiz)):
		quizname = check_hasQuiz[i].quiz_name
		quiz = Quiz.query.filter_by(quiz_name=quizname).first()
		quizdate = quiz.quiz_date
		
#		print(quizdate)
		dateStr = quizdate.strftime("%d-%b-%Y")
#		print(dateStr)
		quizcorrected = quiz.quiz_corrected
		quizlist[i] = {}
		quizlist[i]["quizdate"] = dateStr
		quizlist[i]["quizname"] = quizname
		quizlist[i]["corrected"] = quizcorrected
	
	jsonquiz = json.dumps(quizlist)
	print(jsonquiz)
	return jsonquiz
	
#return image to teacher of a students answer for correcting
@app.route('/getImage/<string:studentName>/<string:quizName>/<string:fileName>')
def getImage(studentName, quizName, fileName):
	
	print(studentName)
	print(quizName)
	print(fileName)
	
	filepath = 'quizImages/' + studentName + '/' + quizName + '/' + fileName + '.png'
	
	return send_file(filepath, mimetype='image/png')
		

#get total number of questions in the quiz
@app.route('/getQuizTotal',methods=['POST'])
def getQuizTotal():
	content = request.get_json(silent=True)
	
	quizName = content['quizName']
	
	questions = Question.query.filter_by(quiz_name=quizName).all()
	
	for i in range(len(questions)):
		numQuestions = questions[i].question_num
	
	print(numQuestions)
	
	return jsonify(
		message = numQuestions
	)

#get questions form a given quiz
@app.route('/getQuestions',methods=['POST'])
def getQuestions():
	content = request.get_json(silent=True)
	
	quizName = content['quizname']
	qTotal = content['qnum']
	
	sum = Question.query.filter_by(quiz_name=quizName).filter_by(question_num=qTotal).first()
	
	sumline = sum.question_sum
	
	print(sumline)
	
	return jsonify (
		sum = sumline
	)
	
#get report for a given quiz for a given student
@app.route('/viewQuiz',methods=['POST'])
def viewQuiz():

	content = request.get_json(silent=True)
	
	quizName = content['quizname']
	
	getQuiz = Quiz.query.filter_by(quiz_name=quizName).first()

	getQuestions = Question.query.filter_by(quiz_name=quizName).all()

	correctAnswerCount = 0
	numQuestions = 0

	#dictionary to show the original number of questions for each operator
	#vs the number of correct answers for each operator
	#Used to show what areas student is lacking in
	
	resultsList = {}
	
	originalList = {
		'x':0,
		'/':0,
		'+':0,
		'-':0
	}
	
	correctList = {
		'x':0,
		'/':0,
		'+':0,
		'-':0	
	}

	#go through array of questions and compare student answer to correct answer
	for x in range(len(getQuestions)):
		numQuestions = numQuestions + 1

		getQuestionId = getQuestions[x].question_id
		getQuestionOp = getQuestions[x].question_operator
		originalList[getQuestionOp] = originalList[getQuestionOp] + 1
		getQuestionAnswer = getQuestions[x].question_answer
	
		getStudentAnswers = StudentAnswer.query.filter_by(question_id=getQuestionId).first()
		student_answer = getStudentAnswers.student_answer
		
		if student_answer == getQuestionAnswer:
			correctList[getQuestionOp] = correctList[getQuestionOp] + 1
			print(correctList[getQuestionOp])
			correctAnswerCount = correctAnswerCount + 1

	finalScores = {
		'correct':correctAnswerCount,
		'overall':numQuestions
	}

	resultsList['original'] = originalList
	resultsList['correct'] = correctList
	resultsList['final'] = finalScores
	
	jsonResultsList = json.dumps(resultsList)

	print(jsonResultsList)
	
	return jsonResultsList


# get quiz, get questions get student answers
# compare student answer to question answers
# compare num of correct questions with operators
@app.route('/correctQuiz',methods=['POST'])
def correctQuiz():
	content = request.get_json(silent=True)

	quizName = content['quizname']
	
	print(content)
	
	getQuiz = Quiz.query.filter_by(quiz_name=quizName).first()
	
	getQuiz.quiz_corrected = True
	
	db.session.commit()
	
	return jsonify (
		message = "successfully updated"
	)

#get report for a student overall
@app.route('/getReport',methods=['POST'])
def getReport():
	content = request.get_json(silent=True)
	
	studentname = content['studentName']
	
	getStudent = User.query.filter_by(username=studentname).first()
	userId = getStudent.user_id
	
	get_hasQuiz = HasQuiz.query.filter_by(user_id=userId).all()
	
	correctAnswerCount = 0
	numQuestions = 0

	#dictionary to show the original number of questions for each operator
	#vs the number of correct answers for each operator
	#Used to show what areas student is lacking in
	
	resultsList = {}
	
	originalList = {
		'x':0,
		'/':0,
		'+':0,
		'-':0
	}
	
	correctList = {
		'x':0,
		'/':0,
		'+':0,
		'-':0	
	}
	
	for i in range(len(get_hasQuiz)):
		quizName = get_hasQuiz[i].quiz_name
		getQuestions = Question.query.filter_by(quiz_name=quizName).all()

		print(getQuestions)
		
		for x in range(len(getQuestions)):
			numQuestions = numQuestions + 1

			getQuestionId = getQuestions[x].question_id
			getQuestionOp = getQuestions[x].question_operator
			originalList[getQuestionOp] = originalList[getQuestionOp] + 1
			getQuestionAnswer = getQuestions[x].question_answer
		
			getStudentAnswers = StudentAnswer.query.filter_by(question_id=getQuestionId).first()
			print(getStudentAnswers)
			
			if getStudentAnswers == None:
				break;
			else:
				student_answer = getStudentAnswers.student_answer
				
				if student_answer == getQuestionAnswer:
					correctList[getQuestionOp] = correctList[getQuestionOp] + 1
					print(correctList[getQuestionOp])
					correctAnswerCount = correctAnswerCount + 1
				
	finalScores = {
		'correct':correctAnswerCount,
		'overall':numQuestions
	}

	resultsList['original'] = originalList
	resultsList['correct'] = correctList
	resultsList['final'] = finalScores
	
	jsonResultsList = json.dumps(resultsList)

	print(jsonResultsList)
	
	return jsonResultsList


#URL for google CLoud Vision OVR
#Image would be given to URL and sent up to the API for reviewing of the handwritten text
#response should return what the characters were meant to be
#The API breaks the page down into paragraphs and lines and returns what is in each
	
#@app.route('/vision/<string:studentName>/<string:quizName>/<string:fileName>')
#def cloud_vision(studentName, quizName, fileName):
#
#	filepath = 'quizImages/' + studentName + '/' + quizName + '/' + fileName + '.png'
#
#	client = vision.ImageAnnotatorClient()
#
#	with io.open(filepath, 'rb') as image_file:
#		content = image_file.read()
#
#	image = vision.types.Image(content=content)

#	response = client.document_text_detection(image=image)

#	for page in response.full_text_annotation.pages:
#		for block in page.blocks:
#			print('\nBlock confidence: {}\n'.format(block.confidence))
#
#			for paragraph in block.paragraphs:
#				print('Paragraph confidence: {}'.format(
#				paragraph.confidence))
#
#				for word in paragraph.words:
#					word_text = ''.join([
#					symbol.text for symbol in word.symbols
#					])
#					print('Word text: {} (confidence: {})'.format(
#					word_text, word.confidence))
#
#					for symbol in word.symbols:
#						print('\tSymbol: {} (confidence: {})'.format(
#						symbol.text, symbol.confidence))
#
	
if __name__ == '__main__':
    app.run()
	
