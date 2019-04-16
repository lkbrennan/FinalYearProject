import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import {Platform, StyleSheet, Text, TextInput, Button, View} from 'react-native';
import {IP_ADDRESS} from './globalVars';

import RNFetchBlob from 'react-native-fetch-blob';

import ImgToBase64 from 'react-native-image-base64';

type Props = {};

const answerArray = [];
const correctAnswer = [];
const questionArray = [];
const qtotal = 0;
			
/*
on completion of the quiz, the student is shown to this page
when they hit the finish quiz button they are popped back to the start of the user stack
*/
export default class QuizComplete extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			loaded : 'false',
			path : null
		}
	}
	
	navigationOptions:  {
		title: 'Quiz',
		headerLeft: null
	}

	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>Well Done!</Text>
				<Text style={styles.welcome}>Youve finished the quiz! </Text>
				<Button
					onPress={ () => this.props.navigation.popToTop() }
					title="Finish"
					color="#33cc33"
				/>
			</View>
		);
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
	},
});
