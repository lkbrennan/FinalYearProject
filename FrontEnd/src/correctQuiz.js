import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import {Platform, StyleSheet, Text, Button, View, Image, TouchableOpacity, TextInput} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

const sumline = '';

/*
correct quiz questions page
*/

export default class CorrectQuiz extends Component<Props> {
	constructor(props) {
		super(props);
		
		this.state = {
			loaded:'false',
			filePath:'',
			qnum:0,
			qtotal:0,
			studentname:"",
			quizname:"",
			studentAnswer:'0',
			sum:''
		}
	}
	
	//get student names and quiz name from react navigation parameters
	//fetch question data from server
	retrieveData = async() => {
		const { navigation } = this.props;
		const studentName = navigation.getParam("studentName", "None");
		const quizName = navigation.getParam("quizName", "None");
		const qnum = navigation.getParam("qnum",1);
		const qtotal = navigation.getParam("totalQuestions",1);
		
		const filePathString = studentName + '/' + quizName + '/' + qnum.toString();
		
		fetch(IP_ADDRESS + "getQuestions", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
					quizname: quizName,
					qnum: qnum
				}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			var sumline = responseJson['sum'];
			
			this.setState({sum:sumline});
			this.setState({studentname:studentName});
			this.setState({quizname:quizName});
			this.setState({filePath:filePathString});
			this.setState({qnum:qnum});
			this.setState({qtotal:qtotal});
			this.setState({loaded:'true'});
		
		}).catch((error) => {
			console.error(error);
		});
	}
	
	componentWillMount(){
		this.retrieveData().done();
	}
	
	render() {
		if(this.state.loaded == "false"){
			return(
				<View style={styles.container}>
					<Text>Loading...</Text>
				</View>
			);
		}
		return (
			<View style={{flex:1}}>
				<View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
					<Text style={{fontSize:25}}>{ this.state.sum }</Text>
				</View>
				<View style={{flex:4}}>
				<Image
					source={{
					uri: IP_ADDRESS + 'getImage/' + this.state.filePath
					}}
					style={{width: 300, height: 300}}
				/>
				</View>
				<View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
					<Text>What was the students final answer?</Text>
					<TextInput 
						style={styles.input}
						keyboardType='numeric'
						onChangeText={(text)=> this.onChanged(text)}
						value={this.state.studentAnswer}
						maxLength={10}  
					/>
				</View>
				<View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
					<TouchableOpacity style={styles.buttonContainer}
						onPress={() => this.checkNext() } >
						<Text style={styles.buttonText}>NEXT</Text>
					</TouchableOpacity> 
				</View>
			</View>
		);
	}
	
	onChanged (text) {
		let newText = '';
		let numbers = '0123456789';

		for (var i=0; i < text.length; i++) {
			if(numbers.indexOf(text[i]) > -1 ) {
				newText = newText + text[i];
			}
			else {
				// your call back function
				alert("please enter numbers only");
			}
		}
		this.setState({ studentAnswer: newText });
	}
	
	//post the anwer data from the question to the server
	//check if quiz is over
	//if its over, send user to correction finished page to send quiz data to server
	//if its notover send to the next question
	checkNext = async() => {
		fetch(IP_ADDRESS + "postQuestions", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
					username: this.state.studentname,
					quizname: this.state.quizname,
					answer: this.state.studentAnswer,
					qnum: this.state.qnum
				}),
		}).then((response) => response.json())
		
		const { navigation } = this.props;
		
		if(this.state.qnum < this.state.qtotal){
			this.state.qnum = this.state.qnum + 1
			this.props.navigation.push('CorrectQuizPage',{
				qnum: this.state.qnum,
				totalQuestions: this.state.qtotal,
				quizName: this.state.quizname,
				studentName: this.state.studentname
			})
		} else {
			this.props.navigation.push('CorrectionCompletePage',{
				quizName: this.state.quizname
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
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  }, buttonContainer:{
        backgroundColor: "#33cc33",
        paddingVertical: 10,
		marginBottom: 20,
		width: 300
    }, buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    }, input:{
		backgroundColor: 'rgba(204,204,204,0.5)',
		paddingVertical: 5,
		marginBottom: 20,
		width: 300
	}
});
/*
import React from "react";
import SignedOut from "../App";

type Props = {};

export default class App extends React.Component{
	render() {
		return <SignedOut />;
	}
}*/
