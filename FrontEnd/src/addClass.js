import React, {Component} from 'react';
import {Platform, StyleSheet, KeyboardAvoidingView, TouchableOpacity, Text, TextInput, Button, View, FlatList, AsyncStorage, TouchableHighlight} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

/*
page to add class to a users list
*/

export default class AddClass extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			data:[],
			userName: "",
			loaded:'false',
			accountType: "",
			classNameVal : "",
			classPasswordVal : "",
			accountName: ""
		};
	}
	
	//retrieve data from async storage before page loads
	retrieveData = async() => {
		try {
			this.state.accountType = await AsyncStorage.getItem('userType');
			this.state.accountName = await AsyncStorage.getItem('userName');
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
	
	static navigationOptions = {
		headerTitle: "Add Class",
	};

	render() {
		//check if data has been returned successfully from the retrieveData function
		if (this.state.loaded === 'true') {
			//if the user is a student
			//let them pick a class to be added to
			if(this.state.accountType == "student"){
				return (
					<KeyboardAvoidingView style={styles.container}>
						<View style={{flex:2, alignItems: 'center', justifyContent: 'center'}}>
							<Text style={styles.title}>Join A Class</Text>
							<Text style={styles.subtitle}>Join a Class by putting the class name and password below!</Text>
						</View>
						<View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
							<TextInput 
								style={styles.input}
								placeholder = "Class Name"
								onChangeText={(classNameVal) => this.setState({classNameVal})}
							/>
							<TextInput 
								style={styles.input}
								placeholder = "Class Password"
								onChangeText={(classPasswordVal) => this.setState({classPasswordVal})}
							/>
							<TouchableOpacity style={styles.buttonContainer}
								onPress= { () => this.addNewClass() } >
								<Text  style={styles.buttonText}>ADD CLASS</Text>
							</TouchableOpacity> 
						</View>
					</KeyboardAvoidingView>
				);
			//if the user is a teacher, let them create a class
			} else if (this.state.accountType == "teacher"){
				return (
					<KeyboardAvoidingView style={styles.container}>
						<View style={{flex:2, alignItems: 'center', justifyContent: 'center'}}>
							<Text style={styles.title}>Create A New Class</Text>
							<Text style={styles.subtitle}>Put in a class name and password that students can use to access the class</Text>
						</View>
						<View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
							<TextInput 
								style={styles.input}
								placeholder = "Class Name"
								onChangeText={(classNameVal) => this.setState({classNameVal})}
							/>
							<TextInput 
								style={styles.input}
								placeholder = "Class Password"
								onChangeText={(classPasswordVal) => this.setState({classPasswordVal})}
							/>
							<TouchableOpacity style={styles.buttonContainer}
								onPress= { () => this.addNewClass() } >
								<Text  style={styles.buttonText}>CREATE CLASS</Text>
							</TouchableOpacity> 
						</View>
					</KeyboardAvoidingView>
				);
			}
		} 
		return (
			<View style={styles.container}>
				<Text>Loading...</Text>
			</View>
		);
	}
	
	//same function is used by both student and teacher as the server checks theyre account type
	addNewClass = async() => {
		if(this.state.classPasswordVal == "" || this.state.classNameVal == ""){
			alert("Please fill in both fields");
		} else {
			fetch(IP_ADDRESS + 'addClass', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: this.state.accountName,
					usertype: this.state.accountType,
					classname: this.state.classNameVal,
					classpassword: this.state.classPasswordVal
				}),
			}).then((response) => response.json())
			.then( async (responseJson) => {
				//depending on the message returned, an error will appear or the new class will be added to the users class list
				if(responseJson['message'] == 'Incorrect Password') {
					alert("Password is incorrect")
				} else if (responseJson['message'] == 'Class exists') {
					alert("Sorry! A class with that name already exists! Please choose a new classname!")
				} else if(responseJson['message'] == "Class does not exist"){
					alert("Sorry, but this class does not exist! Check the name and try again!")
				}else if (responseJson['message'] == 'Class Added'){
					alert("Class has been added successfully!")
					this.props.navigation.pop();
				}
			}).catch((error) => {
				console.error(error);
			});
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
  }, 
  subtitle:{
	  color: '#1c1c1c',
	  margin: 15,
	  fontSize: 20,
	  textAlign:'center'
  },
  title:{
	  color: '#1c1c1c',
	  margin: 15,
	  fontSize: 30
  },
  buttonContainer:{
        backgroundColor: "#33cc33",
        paddingVertical: 10,
		marginBottom: 10,
		width: 300
    },
    buttonText:{
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    },
	input:{
		backgroundColor: 'rgba(204,204,204,0.5)',
		paddingVertical: 5,
		marginBottom: 10,
		width: 300
	}
});