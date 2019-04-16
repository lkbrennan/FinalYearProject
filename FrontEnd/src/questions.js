import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import {Platform, StyleSheet, Text, TextInput, Button, View} from 'react-native';

import RNSketchCanvas from '@terrylinla/react-native-sketch-canvas';


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

export default class Questions extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			loaded : 'false',
			myNumber: '0',
			file_name: '',
			file_path: ''
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
	
	//render canvas element for quiz 
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
				<Text style={styles.welcome}> { this.state.sum } </Text>
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<RNSketchCanvas
						containerStyle={{ backgroundColor: 'transparent', flex: 1 }}
						canvasStyle={{ backgroundColor: 'transparent', flex: 1 }}
						defaultStrokeIndex={0}
						defaultStrokeWidth={5}
						undoComponent={<View style={styles.functionButton}><Text style={{color: 'white'}}>Undo</Text></View>}
						clearComponent={<View style={styles.functionButton}><Text style={{color: 'white'}}>Clear</Text></View>}
						strokeComponent={color => (
							<View style={[{ backgroundColor: color }, styles.strokeColorButton]} />
						)}
						strokeSelectedComponent={(color, index, changed) => {
							return (
							<View style={[{ backgroundColor: color, borderWidth: 2 }, styles.strokeColorButton]} />
							)
						}}
						strokeWidthComponent={(w) => {
							return (<View style={styles.strokeWidthButton}>
							<View  style={{
								backgroundColor: 'white', marginHorizontal: 2.5,
								width: Math.sqrt(w / 3) * 10, height: Math.sqrt(w / 3) * 10, borderRadius: Math.sqrt(w / 3) * 10 / 2
							}} />
							</View>
						)}}
						saveComponent={<View style={styles.functionButton}><Text style={{color: 'white'}}>Save</Text></View>}
						savePreference={() => {
							this.state.file_name = String(Math.ceil(Math.random() * 100000000))
							return {
								folder: 'ClassPal',
								filename: this.state.file_name,
								transparent: false,
								imageType: 'png'
							}
						}}
						onSketchSaved={(success, filePath) => { alert('filePath: ' + filePath); }}
					/>
				</View>
				<View style={{flexDirection:'row'}}>
					<Button
						onPress={() => this.props.navigation.goBack()}
						style={styles.quizButtonBack}
						title="Back"
						color="#f90404"
					/>
					<Button
						onPress={() => this.checkNext() }
						style={styles.quizButtonNext}
						title="Next"
						color="#12f902"
					/>
				</View>
			</View>
		);
	}
	
	//send the students answer and the filepath to the images to the server
	//check if the quiz has reached its last question
	//if its the last question, send the student to the finishQuiz page
	//if the quiz isnt finished, send them to the next question
	checkNext = async() => {
		var PicturePath = 'file:///storage/emulated/0/Pictures/ClassPal/' + this.state.file_name + '.png';
		
		var accountName = await AsyncStorage.getItem('userName');
		var quizName = await AsyncStorage.getItem('QuizName');
				
		var data = new FormData();
		
		data.append('my_photo', {
			uri: PicturePath,
			name: 'my_photo.png',
			type: 'image/png',
		});
		
		data.append('username', accountName)
		data.append('filename', String(this.state.questionNum))
		data.append('quizname', quizName)
		
		fetch(IP_ADDRESS + "postImageQuestions", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'multipart/form-data'
			},
			body: data,
		}).then((response) => response.json())
		
		const { navigation } = this.props;
		this.state.questionTotal = navigation.getParam("qtotal", 0);
		
		if(this.state.questionNum < this.state.questionTotal){
			this.state.answerArray[this.state.questionNum - 1] = this.state.file_name;
			this.props.navigation.push('QuestionPage',{
				qnum: this.state.questionNum,
				qtotal: this.state.questionTotal,
				answers: this.state.answerArray,
				correctAnswers: this.state.correctAnswers,
				questionsArray: this.state.questionArray
			})
		} else {
			this.state.answerArray[this.state.questionNum - 1] = this.state.file_name;
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
    fontWeight: "bold"
  },
  strokeColorButton: {
    marginHorizontal: 2.5, marginVertical: 8, width: 30, height: 30, borderRadius: 15,
  },
  strokeWidthButton: {
    marginHorizontal: 2.5, marginVertical: 8, width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#39579A'
  },
  functionButton: {
    marginHorizontal: 2.5, marginVertical: 8, height: 30, width: 60,
    backgroundColor: '#39579A', justifyContent: 'center', alignItems: 'center', borderRadius: 5,
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
	quizButtonBack: {
		position: 'absolute',
		bottom:0,
		left:0,
		flex: 0.5,
	},
	quizButtonNext: {
		position: 'absolute',
		bottom:0,
		right:0,
		flex: 0.5,
	},
});
