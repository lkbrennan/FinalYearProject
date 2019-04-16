import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import {Platform, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {IP_ADDRESS} from './globalVars';

const questionNum = 0;
const questionTotal = 0;
const answerArray = [];
const correctAnswers = [];
const questionArray = [];
const sum = ""
type Props = {};


/*
input questions pages of the quiz
*/

export default class InputQuestions extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			loaded : 'false',
			studentAnswer: '0',
		}
	};
	
	//retrieve questions data from async storage
	//set sumline as the questions sum for it to be displayed on the screen
	retrieveData = async () => {
		try {
			const { navigation } = this.props;
			const qId = navigation.getParam("qnum", 0);
			this.state.answerArray = navigation.getParam("answers", ['3','2','1']);
			this.state.correctAnswers = navigation.getParam("correctAnswers", [3,2,1]);
			this.state.questionArray = navigation.getParam("questionsArray",['3','2','1']);
			const value = await AsyncStorage.getItem('Questions');
			const val = JSON.parse(value)
			if (value !== null) {
				this.state.sum = val[qId]["sumline"];
				this.state.questionArray[qId] = this.state.sum;
				this.setState({loaded: 'true'});
				this.state.questionNum = qId + 1;
				this.state.correctAnswers[qId] = val[qId]["answer"];
			} else {
				this.setState({loaded: 'false'});
				this._setValue();
			}
		} catch (error) {
			alert(error);
			this.setState({loaded: 'false'});
		}
	}
  
	componentWillMount() {
		this.retrieveData().done();
	}
	
	navigationOptions:  {
		title: 'Quiz',
		headerLeft: null
	}
	
	render() {
		if (this.state.loaded === 'false') {
			return (
				<View style={styles.container}>
					<Text>Loading...</Text>
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<View style={{flex:3, justifyContent : 'center', alignItems:'center'}}>
				<Text style={styles.welcome}> { this.state.sum } </Text>
				<TextInput 
					style={styles.input}
					keyboardType='numeric'
					onChangeText={(text)=> this.onChanged(text)}
					value={this.state.studentAnswer}
					maxLength={10}  
				/>
				</View>
				<View style={{flex:1}}>
					<TouchableOpacity style={styles.buttonContainer} 
						onPress={() => this.checkNext() }>
						<Text style={styles.buttonText}>NEXT</Text>
					</TouchableOpacity> 
				</View>
			</View>
		);
	}
	
	//on text change function for the student answer
	onChanged (text) {
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
		this.setState({ studentAnswer: newText });
	}
	

	//send the students answer to the server
	//check if the quiz has reached its last question
	//if its the last question, send the student to the finishQuiz page
	//if the quiz isnt finished, send them to the next question
	checkNext = async() => {
		
		var accountName = await AsyncStorage.getItem('userName');
		var quizName = await AsyncStorage.getItem('QuizName');
				
		fetch(IP_ADDRESS + "postQuestions", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
					username: accountName,
					quizname: quizName,
					answer: this.state.studentAnswer,
					qnum: this.state.questionNum
				}),
		}).then((response) => response.json())
		
		const { navigation } = this.props;
		this.state.questionTotal = navigation.getParam("qtotal", 0);
		
		if(this.state.questionNum < this.state.questionTotal){
			this.props.navigation.push('InputQuestionPage',{
				qnum: this.state.questionNum,
				qtotal: this.state.questionTotal,
				answers: this.state.answerArray,
				correctAnswers: this.state.correctAnswers,
				questionsArray: this.state.questionArray
			})
		} else {
			this.props.navigation.push('QuizComplete',{
				qtotal: this.state.questionTotal,
				answers: this.state.answerArray,
				correctAnswers: this.state.correctAnswers,
				questionsArray: this.state.questionArray
			})
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
	headerText: {
		fontSize: 20,
		textAlign: "center",
		margin: 10,
		fontWeight: "bold",
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
	instructions: {
		textAlign: 'center',
		color: '#333333',
		marginBottom: 5,
	},
	buttonContainer:{
        backgroundColor: "#33cc33",
        paddingVertical: 10,
		marginBottom: 10,
		width: 300
    }, buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    },
	input:{
		backgroundColor: 'rgba(204,204,204,0.5)',
		paddingVertical: 5,
		marginBottom: 10,
		width:300
	}
});