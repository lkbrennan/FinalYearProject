import random
import json

#script to create quiz for students
#takes in students choices in the __init__() function
#generates a litst of questions for the studetn based of their choices
#return dictionary to client as json object

class quiz:
	def run(self):
		self.setDifficulty(self.includeTypes)

		for x in range(0,int(self.lengthquiz)):
			self.createSum(x)
		
		return self.sums
	
	def setDifficulty(self, includeTypes):
		self.minnum = 1
		for x in range(len(includeTypes)):
			if(includeTypes[x] == "add"):
				self.operator.append("+")
			if(includeTypes[x] == "sub"):
				self.operator.append("-")
			if(includeTypes[x] == "mul"):
				self.operator.append("x")
			if(includeTypes[x] == "div"):
				self.operator.append("/")
	
	def createSum(self, x):
		self.num1 = self.getNumbers()
		self.num2 = self.getNumbers()
		self.op = self.operator[self.getOperator()]

		if(self.num2>self.num1) and (self.op == "-"):
			self.correctAns = self.switch(self.num2,self.num1)
			self.sumline = str(self.num2) + str(self.op) + str(self.num1)
			
		else:
			self.correctAns = self.switch(self.num1,self.num2)
			self.sumline = str(self.num1) + str(self.op) + str(self.num2)
		
		self.sums[x] = {}
		self.sums[x]["sumline"] = self.sumline
		self.sums[x]["answer"] = self.correctAns
		self.sums[x]["operator"] = self.op
	
	def switch(self,a,b):
		return {
			'+': a+b,
			'-': a-b,
			'x': a*b,
			'/': a/b
		}.get(self.op,"error")

	def getNumbers(self):
		return random.randint(self.minnum,self.maxnum)

	def getOperator(self):
		j = random.randint(0,len(self.operator)-1)
		return j			

	def __init__(self, max, qnum, typeInclude):
		self.maxnum = int(max)
		self.lengthquiz = qnum
		self.includeTypes = typeInclude
		self.minnum, self.num1, self.num2 = 0,0,0
		self.operator = []
		self.op = ""
		self.sumline = ""
		self.sums = {}
		self.ans = {}
		self.run()
	
if __name__ == "__quiz__":
    quiz(level, qnum)