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
page shown when corrections are complete
*/

export default class CorrectionComplete extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			loaded : 'false',
			path : null,
			quizName : ''
		}
	}
	
	//get the data sent across in the react navigation parameters
	retrieveData = async () => {
		try {
			const { navigation } = this.props;
			const quizname= navigation.getParam("quizName", '');
			this.state.quizName = quizname;
			this.setState({loaded: 'true'});
		} catch(error){
			alert(error);
			this.setState({loaded: 'false'});
		}
	}
	
	componentWillMount() {
		this.retrieveData().done();
	}
	
	render() {
		if(this.state.loaded == 'false'){
			<View>
				<Text>Loading...</Text>
			</View>
		}
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>You have corrected this students test</Text>
				<Text style={styles.welcome}>Please press Finish to send the results to the server</Text>
				<Button
					onPress={ () => this.submitResults(this.state.quizName) }
					title="Finish"
					color="#33cc33"
				/>
			</View>
		);
	}
	
	//submit quiz results to the server to be updated on the db
	submitResults = async(quizName) => {
		fetch(IP_ADDRESS + 'correctQuiz', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				quizname: quizName
			}),
		}).then((response) => response.json())
		
		this.props.navigation.popToTop()
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
