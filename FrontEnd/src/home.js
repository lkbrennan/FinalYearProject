import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import {Platform, StyleSheet, Text, Button, View, TouchableOpacity} from 'react-native';

type Props = {};

/*
student home page
lets them take a quiz or view their list of quizzes
*/

export default class Home extends Component<Props> {
	constructor(props) {
		super(props);
		
		this.state = {
			userName:"",
			userType:'',
			loaded:'false'
		}
	}
	
	//retrieve data from async storage
	retrieveData = async() => {
		try {
			this.state.userType = await AsyncStorage.getItem('userType');
			this.state.userName = await AsyncStorage.getItem('userName');
			this.setState({loaded: 'true'});
		} catch (error) {
		// Error retrieving data
			alert(error);
			this.setState({loaded: 'false'});
		}
	}
	
	componentWillMount(){
		this.retrieveData().done();
	}
	
	static navigationOptions = {
		headerTitle: "Home",
	};

	render() {
		//if data hasnt loaded then show this screen
		if(this.state.loaded == 'false'){
			return(
				<View style={styles.container}>
					<Text>Loading...</Text>
				</View>
			);
		}
		//otherwise show student their choices
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>Want to take a quiz?</Text>
				<TouchableOpacity
					style={styles.buttonContainer}
					onPress={() => this.props.navigation.push('QuizPage') }>
					<Text  style={styles.buttonText}>TAKE QUIZ</Text>
				</TouchableOpacity>
				<Text style={styles.welcome}>Or view your quizzes?</Text>
				<TouchableOpacity
					style={styles.buttonContainer}
					onPress={() => this.props.navigation.push('QuizListPage',{
						studentName:this.state.userName,
						userType:this.state.userType
					}) }>
					<Text  style={styles.buttonText}>VIEW QUIZ</Text>
				</TouchableOpacity>
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
  }, buttonContainer:{
        backgroundColor: "#33cc33",
        paddingVertical: 10,
		marginBottom: 10,
		width: 300
    },
    buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    }
});
