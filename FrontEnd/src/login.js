import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import {Platform, StyleSheet, Text, TouchableOpacity, View, TextInput, Image, KeyboardAvoidingView} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

/*
user login page
user inputs email address and password and sends to the server to check if user exists or not
*/

export default class Login extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			emailVal: "",
			passwordVal: "",
			accountType: "",
			accountName:"",
			accountEmail:"",
			accountPw:""
		}
	}
	
	static navigationOptions = {
		title: 'Sign In',
	}
	
	render() {
		return (
			<KeyboardAvoidingView style={styles.container} enabled >
				<View style={{flex:3, justifyContent:'center', alignItems: 'center'}}>
					<Image resizeMode="contain" style={styles.logo} source={require('../logo.png')} />
				</View>
				<View style={{flex:3, justifyContent:'center'}}>
					<Text style={styles.welcome}>Enter your login information below!</Text>
					<TextInput 
						style={styles.input} 
						placeholder = "Email"
						keyboardType = "email-address"
						onChangeText={(emailVal) => this.setState({emailVal})}
					/>
					<TextInput 
						style={styles.input} 
						placeholder = "Password"
						secureTextEntry 
						onChangeText={(passwordVal) => this.setState({passwordVal})}
					/>
					<TouchableOpacity style={styles.buttonContainer} 
						onPress={() => this.logIn()}>
						<Text  style={styles.buttonText}>LOGIN</Text>
					</TouchableOpacity> 
					<TouchableOpacity style={styles.buttonContainer} 
						onPress={() => this.props.navigation.navigate('SignUpPage')}>
						<Text  style={styles.buttonText}>CREATE AN ACCOUNT</Text>
					</TouchableOpacity> 
				</View>
			</KeyboardAvoidingView>
		);
	}
	logIn = async() => {
		fetch(IP_ADDRESS + 'login', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: this.state.emailVal,
				pw: this.state.passwordVal,
			}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			if(responseJson['message'] == 'user does not exist') {
				alert("This user does not exist. Please sign up to create an account")
			} else if (responseJson['message'] == 'incorrect password') {
				alert("Password is incorrect")
			} else if (responseJson['message'] == 'logged in'){
				this.state.accountType = responseJson['utype']
				this.state.accountName = responseJson['uname']
				this.state.accountEmail = responseJson['uemail']
				this.state.accountPw = responseJson['upassword']
				this.logInAsync()
			}
		}).catch((error) => {
			console.error(error);
		});
	}
	
	logInAsync = async () => {
		await AsyncStorage.setItem('userToken', 'abc');
		await AsyncStorage.setItem('userName', this.state.accountName);
		await AsyncStorage.setItem('userEmail', this.state.accountEmail);
		await AsyncStorage.setItem('userPassword', this.state.accountPw);
		
		if(this.state.accountType == 'student'){
			await AsyncStorage.setItem('userType', 'student');
			this.props.navigation.navigate('StudentApp');
		} else if (this.state.accountType == 'teacher'){
			await AsyncStorage.setItem('userType', 'teacher');
			this.props.navigation.navigate('TeacherApp');
		}
	};
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
  }, logo: {
    position: 'absolute',
    width: 300,
	height: 150
  },
      buttonContainer:{
        backgroundColor: "#33cc33",
        paddingVertical: 10,
		marginBottom: 10
    },
    buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    },
	input:{
		backgroundColor: 'rgba(204,204,204,0.5)',
		paddingVertical: 5,
		marginBottom: 10
	}
});
