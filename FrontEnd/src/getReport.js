import React, {Component} from 'react';
import {Platform, StyleSheet, Text, Button, Alert, View} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

const data = ''

/*
get the report for a given students quiz results
*/
export default class GetReport extends Component<Props> {
	constructor(props) {
		super(props);
		
		this.state = {
			loaded:'false',
			studentname:'',
			quizname:'',
			originalList:[],
			correctList:[],
			finalScore:[],
			data:"nothelloyet"
		}
	}
	
	//retrieve quiz data from the server
	//returns a json object of questions answered and quiz result
	retrieveData = async() => {
		const { navigation } = this.props;
		const studentName = navigation.getParam("studentName", "None");
		this.state.studentname = studentName;
		fetch(IP_ADDRESS + 'getReport', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				studentName: this.state.studentname,
			}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			var original = responseJson['original'];
			var correct = responseJson['correct'];
			var finals = responseJson['final'];

			this.setState({originalList:[original]});
			this.setState({correctList:[correct]});
			this.setState({finalScore:[finals]});
			this.setState({loaded:'true'});
		});
	}
	
	componentWillMount(){
		this.retrieveData().done();
	}
	
	static navigationOptions = {
		headerTitle: "View Quiz",
	};
	
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
				<View style={{flexDirection:'row', flex:1, margin: 20, alignItems:'center'}}>
					<Text style={styles.title}> {this.state.studentname}</Text>
				</View>
				<View style={{flexDirection:'row', flex:1, margin: 15, alignItems:'center'}}>
					<Text style={styles.subtitle}>Final Score : </Text>
					<Text style={styles.textStyle}>{ this.state.finalScore[0]['correct'] } / { this.state.finalScore[0]['overall'] }</Text>
				</View>
				<View style={{flexDirection:'row', flex:1, margin: 15, alignItems:'center'}}>
					<Text style={styles.subtitle}>Number of addition questions correct : </Text>
					<Text style={styles.textStyle}>{ this.state.correctList[0]['+']} / { this.state.originalList[0]['+']}</Text>
				</View>
				<View style={{flexDirection:'row', flex:1, margin: 15, alignItems:'center'}}>
					<Text style={styles.subtitle}>Number of subtraction questions correct : </Text>
					<Text style={styles.textStyle}>{ this.state.correctList[0]['-']} / { this.state.originalList[0]['-']}</Text>
				</View>
				<View style={{flexDirection:'row', flex:1, margin: 15, alignItems:'center'}}>
					<Text style={styles.subtitle}>Number of multiplication questions correct : </Text>
					<Text style={styles.textStyle}>{ this.state.correctList[0]['x']} / { this.state.originalList[0]['x']}</Text>
				</View>
				<View style={{flexDirection:'row', flex:1, margin: 15, alignItems:'center'}}>
					<Text style={styles.subtitle}>Number of division questions correct : </Text>
					<Text style={styles.textStyle}>{ this.state.correctList[0]['/']} / { this.state.originalList[0]['/']}</Text>
				</View>
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
  }, title:{
	  fontSize: 20,
	  color: '#1c1c1c',
	  textAlign:'center'
  }, subtitle:{
	  fontSize:15,
	  color: '#1c1c1c'
  }, textStyle:{
	  fontSize:15
  }
});