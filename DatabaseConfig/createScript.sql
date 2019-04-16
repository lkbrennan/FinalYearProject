DROP TABLE has_class;
DROP TABLE classes;
DROP TABLE user_account;

CREATE TABLE user_account(
	user_id serial PRIMARY KEY,
	username VARCHAR (50) UNIQUE NOT NULL,
	password VARCHAR (50) NOT NULL,
	email VARCHAR (355) UNIQUE NOT NULL,
	type VARCHAR(8) NOT NULL
);

CREATE TABLE classlist(
	class_id serial PRIMARY KEY,
	class_name VARCHAR(50) UNIQUE NOT NULL,
	class_password VARCHAR(50) NOT NULL
);

CREATE TABLE has_class(
	has_class_id SERIAL PRIMARY KEY,
	class_id INTEGER NOT NULL REFERENCES classlist(class_id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL REFERENCES user_account(user_id) ON DELETE CASCADE
);

CREATE TABLE quiz(
	quiz_name VARCHAR(100) PRIMARY KEY,
	quiz_corrected BOOLEAN,
	quiz_Corrected DATE
);

CREATE TABLE has_quiz(
	has_quiz_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES user_account(user_id) ON DELETE CASCADE,
	quiz_name VARCHAR(100) NOT NULL REFERENCES quiz(quiz_name) ON DELETE CASCADE
);

CREATE TABLE questions(
	question_id serial PRIMARY KEY,
	question_num INTEGER NOT NULL,
	quiz_name VARCHAR(100) NOT NULL REFERENCES quiz(quiz_name) ON DELETE CASCADE,
	question_sum VARCHAR(10) NOT NULL,
	question_answer VARCHAR(10) NOT NULL,
	quiestion_operatori VARCHAR(10),
);

CREATE TABLE studentanswer(
	answer_id serial PRIMARY KEY,
	question_id INTEGER NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
	file_path VARCHAR(250) UNIQUE NOT NULL,
	student_answer VARCHAR(10),
);