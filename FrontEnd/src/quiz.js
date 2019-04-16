import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import {Platform, ScrollView, KeyboardAvoidingView, TouchableOpacity, StyleSheet, Text, View, TextInput, Picker, Button} from 'react-native';
import {IP_ADDRESS} from './globalVars';
import UUIDGenerator from 'react-native-uuid-generator';
import {CheckBox} from 'react-native-elements';

const level = "";
const quiztype = "";
const quizLength = "0";
const myNumber = "";
const quizName = "";
const answerArray = [];
const maxNumber = "0";
const correctAnswers = [];
const questionArray = [];
type Props = {};

/*
The Quiz Screen which shows the student what selection of choices they have when choosing a quiz
*/

export default class Quiz extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			level:"easy",
			maxNumber:"0",
			quiztype: "",
			quizLength:"0",
			answerArray: [''],
			correctAnswers: [0],
			questionArray: [''],
			quizName : null,
			error : "false",
		};
	}
	
	static navigationOptions = { 
		headerTitle: 'Take Quiz' 
	};
	 
	render() {
		return (
			<KeyboardAvoidingView style={styles.container} enabled >
				<ScrollView contentContainerStyle={{flexGrow : 1, justifyContent : 'center', alignItems:'center'}}>
					<Picker
						selectedValue={this.state.quiztype}
						style={{height: 50, width: 300, margin: 20}}
						onValueChange={(itemValue, itemIndex) =>
							this.setState({quiztype: itemValue})
						}>
						
						<Picker.Item label="Pick a type of quiz to take" value="" />
						<Picker.Item label="Handwritten Quiz" value="handwritten" />
						<Picker.Item label="Input Answer Only Quiz" value="inputonly" />
					</Picker>
					<Text style={styles.welcome}>Please check what you would like to include in the quiz</Text>
					<View style={{flexDirection:'column'}}>
						<CheckBox
							title='Addition +'
							checked={this.state.add}
							checkedIcon='dot-circle-o'
							uncheckedIcon='circle-o'
							onPress={() => this.setState({add: !this.state.add})}
						/>
						<CheckBox
							title='Subtraction -'
							checked={this.state.sub}
							checkedIcon='dot-circle-o'
							uncheckedIcon='circle-o'		
							onPress={() => this.setState({sub: !this.state.sub})}
						/>
						<CheckBox
							title='Multiplication x'
							checked={this.state.mul}
							checkedIcon='dot-circle-o'
							uncheckedIcon='circle-o'
							onPress={() => this.setState({mul: !this.state.mul})}
						/>
						<CheckBox
							title='Division %'
							checked={this.state.div}
							checkedIcon='dot-circle-o'
							uncheckedIcon='circle-o'
							onPress={() => this.setState({div: !this.state.div})}
						/>	
					</View>
					<Text style={styles.welcome}>Please pick the maximum number to use in the quiz</Text>
					<TextInput 
						style={styles.input} 
						keyboardType='numeric'
						onChangeText={(text)=> this.maxNumberChanged(text)}
						value={this.state.maxNumber}
						maxLength={3}  
					/>
					<Text style={styles.welcome}>How many questions do you want in the quiz?</Text>
					<TextInput 
						style={styles.input} 
						keyboardType='numeric'
						onChangeText={(quizlen)=> this.quizLengthChanged(quizlen)}
						value={this.state.quizLength}
						maxLength={2}  
					/>
					<TouchableOpacity style={styles.buttonContainer} 
						onPress={ () => this.startQuiz() }>
						<Text style={styles.buttonText}>TAKE QUIZ</Text>
					</TouchableOpacity> 
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}
	
	//onChange text of the quiz length text input
	quizLengthChanged (quizlen) {
		let newText = '';
		let numbers = '0123456789';

		for (var i=0; i < quizlen.length; i++) {
			if(numbers.indexOf(quizlen[i]) > -1 ) {
				newText = newText + quizlen[i];
			}
			else {
				alert("please enter numbers only");
			}
		}
		this.setState({ quizLength: newText });
	}
	
	//onChange text of the maximumnumber to be used text input
	maxNumberChanged (text) {
		let newText = '';
		let numbers = '0123456789';

		for (var i=0; i < text.length; i++) {
			if(numbers.indexOf(text[i]) > -1 ) {
				newText = newText + text[i];
			}
			else {
				alert("please enter numbers only");
			}
		}
		this.setState({ maxNumber: newText });
	}
	
	/*
	starting the quiz sends a fetch request to the server with the students given choices in its body
	the promise returns a json response with the quiz questions and answers
	the student is then remoted to either the inputQuestions or handwrittenQuestions page depending on what quiz they decided to do
	*/
	startQuiz = async() => {
		const { navigation } = this.props;
		accountName = await AsyncStorage.getItem('userName');
		
		if(this.state.quiztype == "" || this.state.quizLength == '0' || this.state.maxNumber == '0' || this.state.quizLength == '' || this.state.maxNumber == ''){
			alert("Please dont leave any sections blank")
		} else{
			let includeType = [''];
			
			if(this.state.add === true){
				includeType.push("add");
			}
			if(this.state.sub === true){
				includeType.push("sub");
			}
			if(this.state.mul === true){
				includeType.push("mul");
			}
			if(this.state.div === true){
				includeType.push("div");
			}
			
			
			UUIDGenerator.getRandomUUID().then((uuid) => {
				var quuid = uuid.toString();
				this.setState({quizName:quuid});
			});
			
			await AsyncStorage.setItem('QuizName', this.state.quizName);
			var quiz_name = await AsyncStorage.getItem('QuizName');

			
			if(quiz_name != null) {
				date = new Date()
				fetch(IP_ADDRESS + 'quiz', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					typeInclude: includeType,
					maxNumber: this.state.maxNumber,
					number: this.state.quizLength,
					quizname: quiz_name,
					currentDate: date,
					quizType: this.state.quiztype,
					username:accountName
				}),
				}).then((response) => response.json())
				.then( async (responseJson) => {
					await AsyncStorage.setItem('Questions', JSON.stringify(responseJson))
					//alert( quiz_name )
					//alert(JSON.stringify(responseJson))
					if(responseJson == "error"){
						this.state.error == "true";
					}else{
						if(this.state.quiztype == "handwritten"){
							this.props.navigation.navigate('QuestionPage', {
								qnum: 0,
								qtype: this.state.quiztype,
								qtotal: parseInt(this.state.quizLength),
								answers: this.state.answerArray,
								correctAnswers: this.state.correctAnswers,
								questionsArray: this.state.questionArray
							})
						} else if(this.state.quiztype == "inputonly"){
							this.props.navigation.navigate('InputQuestionPage', {
								qnum: 0,
								qtype: this.state.quiztype,
								qtotal: parseInt(this.state.quizLength),
								answers: this.state.answerArray,
								correctAnswers: this.state.correctAnswers,
								questionsArray: this.state.questionArray
							})
						}	
					}
				}).catch((error) => {
					console.error(error);
				});
			} else {
				alert("error")
			}
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 20,
	},
	instructions: {
		textAlign: 'center',
		color: '#333333',
		marginBottom: 5,
	},
	input:{
		backgroundColor: 'rgba(204,204,204,0.5)',
		paddingVertical: 5,
		marginBottom: 10,
		width:300
	},buttonContainer:{
        backgroundColor: "#33cc33",
        paddingVertical: 10,
		marginBottom: 10,
		width: 300
    }, buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    }
});
