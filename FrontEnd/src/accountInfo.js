import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import {Platform, StyleSheet, Text, Button, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Alert} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

/*
account viewing screen
*/
export default class Account extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			loaded : 'false',
			accountType: "",
			accountName:"",
			accountEmail:"",
			accountPw:""
		}
	}
	
	static navigationOptions = {
		title: 'Account Details',
	}
	
	//retrieves data from async storage  about user to display on the account oage
	retrieveData = async () => {
		try {
			this.state.accountType = await AsyncStorage.getItem('userType');
			this.state.accountName = await AsyncStorage.getItem('userName');
			this.state.accountEmail = await AsyncStorage.getItem('userEmail');
			this.state.accountPw = await AsyncStorage.getItem('userPassword');
			this.setState({loaded: 'true'});
		} catch (error) {
		// Error retrieving data
			alert(error);
			this.setState({loaded: 'false'});
		}
	}
	
	componentWillMount() {
		this.retrieveData().done();
	}
	
	render() {
		if (this.state.loaded === 'false') {
			return (
				<View style={styles.container}>
					<Text>Loading...</Text>
				</View>
			);
		}
		//else
		return (
			<KeyboardAvoidingView style={styles.container} enabled >
				<View style={{alignItems: 'flex-start', flex: 2, justifyContent: 'center'}}>
					<Text style={styles.title}> Username </Text>
					<Text> { this.state.accountName } </Text>
					<Text style={styles.title}> Email </Text>
					<TextInput 
						style={styles.input}
						value = { this.state.accountEmail }
						onChangeText={(accountEmail) => this.setState({accountEmail})}
						keyboardType = "email-address"
					/>
					<Text style={styles.title}> Account Type </Text>
					<Text> { this.state.accountType } </Text>
					<Text style={styles.title}> Password </Text>
					<TextInput 
						style={styles.input}
						value = { this.state.accountPw }
						secureTextEntry 
						onChangeText={(accountPw) => this.setState({accountPw})}
					/>
				</View>
				<View style={styles.container,{flex:1}}>
					<TouchableOpacity style={styles.buttonContainer} 
						onPress={ () => this.updateCheck() } >
						<Text style={styles.buttonText}>UPDATE ACCOUNT</Text>
					</TouchableOpacity> 
					<TouchableOpacity style={styles.buttonContainer}
						onPress={ () => this.deleteCheck() } >
						<Text style={styles.buttonText}>DELETE ACCOUNT</Text>
					</TouchableOpacity> 
					<TouchableOpacity style={styles.buttonContainer}
						onPress={ () => this.logOut() } >
						<Text style={styles.buttonText}>SIGN OUT</Text>
					</TouchableOpacity> 
				</View>
			</KeyboardAvoidingView>
		);
	}

	//checks if user wants to update account
	updateCheck = () =>{
		Alert.alert(
			'Update account',
			'By clicking Yes, you will update the email of this account. If you want to keep your original email, then please press cancel.',
			[
				{
					text: 'Yes', 
					onPress: () => this.updateAccount()
				},
				{
					text: 'Cancel',
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel',
				}
			],
			{cancelable: false},
		);
	}
	
	//sends updated account information to the server to be updated on the database	
	updateAccount = () => {
		fetch(IP_ADDRESS + 'accountUpdate', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: this.state.accountEmail,
				username: this.state.accountName,
				password: this.state.accountPw,
			}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			await AsyncStorage.setItem('userEmail', this.state.accountEmail);
			await AsyncStorage.setItem('userPassword', this.state.accountPw);
			alert(responseJson['message'])
		}).catch((error) => {
			console.error(error);
		});
	};
	
	//logs user out and clears async storage
	logOut = async () => {
		await AsyncStorage.clear();
		this.props.navigation.navigate('Auth');
	}
	
	//check if user wants to delete account
	deleteCheck = () =>{
		Alert.alert(
			'Delete account',
			'By clicking Yes, you will delete this account permanently. If you do not want to delete your account, then please press cancel.',
			[
				{
					text: 'Yes', 
					onPress: () => this.deleteAccount()
				},
				{
					text: 'Cancel',
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel',
				}
			],
			{cancelable: false},
		);
	}	
	
	//deletes user account
	deleteAccount = async () => {
		fetch(IP_ADDRESS + 'accountDelete', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: this.state.accountName,
			}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			await AsyncStorage.clear();
			alert(responseJson['message'])
			this.props.navigation.navigate('Auth')
		}).catch((error) => {
			console.error(error);
		});
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
  title: {
    textAlign: 'left',
    color: '#1c1c1c',
    marginBottom: 5,
	marginTop: 15
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