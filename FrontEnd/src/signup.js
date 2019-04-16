import React, {Component} from 'react';
import {Platform, StyleSheet, Text, Button, TouchableOpacity, View, KeyboardAvoidingView, TextInput, Picker} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

export default class SignUp extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			emailVal: "",
			passwordVal1: "",
			passwordVal2: "",
			usernameVal: "",
			checkCounter: 0,
			accountType: "",
		}
	}
	static navigationOptions = {
		title: 'Create an Account',
	}
	render() {
		return (
			<KeyboardAvoidingView style={styles.container} enabled>
				<View style={{flex:1, justifyContent:'center', alignItems: 'center'}}>
					<Text style={styles.welcome}>Enter your information below to create an account</Text>
					<Text style={styles.welcome}>Are you a student or a teacher?</Text>
				</View>
				<View style={{flex:3, justifyContent:'center', alignItems: 'center'}}>
					<Picker
						selectedValue={this.state.accountType}
						style={{height: 50, width: 300}}
						onValueChange={(itemValue, itemIndex) =>
							this.setState({accountType: itemValue})
						}>
						<Picker.Item label="Choose an account type" value="" />
						<Picker.Item label="Student" value="student" />
						<Picker.Item label="Teacher" value="teacher" />
					</Picker>
					<TextInput 
						style={styles.input}
						placeholder = "Email"
						keyboardType = "email-address"
						onChangeText={(emailVal) => this.setState({emailVal})}
					/>
					<TextInput 
						style={styles.input}
						placeholder = "Username"
						onChangeText={(usernameVal) => this.setState({usernameVal})}
					/>
					<TextInput 
						style={styles.input}
						placeholder = "Password"
						secureTextEntry 
						onChangeText={(passwordVal1) => this.setState({passwordVal1})}
					/>
					<TextInput 
						style={styles.input}
						placeholder = "Reenter Password"
						secureTextEntry 
						onChangeText={(passwordVal2) => this.setState({passwordVal2})}
					/>
					<TouchableOpacity style={styles.buttonContainer} 
						onPress= { () => this.signUp() } >
						<Text style={styles.buttonText}>CREATE ACCOUNT</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.buttonContainer} 
						onPress={() => this.props.navigation.navigate('LogInPage')}>
						<Text  style={styles.buttonText}>SIGN IN</Text>
					</TouchableOpacity> 
				</View>
			</KeyboardAvoidingView>
		);
	}
	signUp = async() => {
		if(this.state.emailVal.includes('@') == true ){
			this.state.checkCounter++;
		}
		if(this.state.passwordVal1 == this.state.passwordVal2){
			this.state.checkCounter++;
		}
		if(this.state.emailVal != "" | this.state.usernameVal != "" | this.state.passwordVal1 != "" | this.state.passwordVal2 != "" ){
			this.state.checkCounter++;
		}
		if(this.state.checkCounter == 3){
			fetch(IP_ADDRESS + 'signup', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: this.state.emailVal,
					pw: this.state.passwordVal1,
					username: this.state.usernameVal,
					account: this.state.accountType
				}),
			}).then((response) => response.json())
				.then( async (responseJson) => {
					if(responseJson['message'] == 'error caught') {
						alert("That username or email is already registered on this application. Please try again!")
					} else if (responseJson['message'] == 'signed up') {
						alert("Your account has been created. You will now be redirected to the login page.")
						this.props.navigation.navigate("LogInPage")
					}
			}).catch((error) => {
				console.error(error);
			});
		} else {
			this.state.checkCounter = 0;
			alert("u dun goofed");
		}
	}
	
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5FCFF',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	}, welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	}, buttonContainer:{
        backgroundColor: "#33cc33",
        paddingVertical: 10,
		marginBottom: 10,
		width: 300
    }, buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    }, input:{
		backgroundColor: 'rgba(204,204,204,0.5)',
		paddingVertical: 5,
		marginBottom: 10,
		width: 300
	}
});
