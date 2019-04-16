import React, {Component} from 'react';
import {Platform, StyleSheet, TouchableOpacity, Text, Button, Alert, View, FlatList, AsyncStorage, TouchableHighlight} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

/*
get list of students for a given class
*/

export default class StudentList extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			data:[],
			loaded:'false',
			class_Name : "",
			accountType: "",
			accountName: "",
			isFetching: false
		};
	}
	
	//retrieve student data from the server 
	//put returned JSON object into an Array
	//array will be put into list of students
	retrieveData = async() => {
		const { navigation } = this.props;
		const className = navigation.getParam("className", "None");
		this.state.accountType = await AsyncStorage.getItem('userType');
		this.state.accountName = await AsyncStorage.getItem('userName');
		fetch(IP_ADDRESS + 'studentList', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				classname: className,
			}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			var newArray = {
				students : []
			};
			Object.keys(responseJson).map(function(key, index) {
				newArray.students.push({
					"studentname" : responseJson[key]["studentname"],
					"id" : responseJson[key]["id"]
				});
			});
			
			j_resp = [newArray];
			this.setState({data: j_resp});
			this.state.class_Name = className;
			this.setState({isFetching:false});
			this.setState({loaded: 'true'});
		}).catch((error) => {
			console.error(error);
		});
	}
	
	componentWillMount() {
		this.retrieveData().done();
	}
	
	static navigationOptions = {
		headerTitle: "Students",
	};
  
	render() {
		if (this.state.loaded === 'true') {
			if(this.state.accountType == "teacher"){
				return (
					<View style={styles.container}>
						<View style={{flex: 5}}>
							<FlatList
								data={this.state.data[0]["students"]}
								onRefresh={() => this.onRefresh()}
								refreshing={this.state.isFetching}
								keyExtractor={(x,i)=>i}
								renderItem={({item}) => 
									<TouchableHighlight
										style={styles.listItem}
										onPress={() => this.goToStudent(item.studentname) }>
										<View style={{backgroundColor: '#F5FCFF'}}>
											<Text style={styles.listText}>{item.studentname}</Text>
										</View>
									</TouchableHighlight>
								}
							/>
						</View>
						<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
							<TouchableOpacity
								style={styles.buttonContainer} 
								onPress={ () => this.deleteCheck() } >
								<Text  style={styles.buttonText}>REMOVE CLASS</Text>
							</TouchableOpacity>
						</View>
					</View>
				);
			} else if (this.state.accountType == "student"){
				return (
					<View style={{flex:1, justifyContent:'center'}}>
						<Text>{this.state.class_Name}</Text>
						<Button
							onPress={() =>
								this.leaveCheck()
							}
							title="Leave Class"
							color="#33cc33"
						/>
					</View>
				);
			}
		}
		return (
			<View style={styles.container}>
				<Text>Loading...</Text>
			</View>
		);
	}
	
	//go to a specific students page
	goToStudent = (studentname) => {
		this.props.navigation.push('StudentViewPage',{
			studentName : studentname,
			className: this.state.class_Name,
			userType: this.state.accountType
		});
	}
	
	//check if the student wants to leave the class
	leaveCheck = () => {
		Alert.alert(
			'Leave Class',
			'By clicking Yes, you will leave this class. If you do not want to leave this class, then please press cancel.',
			[
				{
					text: 'Yes', 
					onPress: () => this.deleteClass()
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
	
	//check if teacher wants to delete the class
	deleteCheck = () =>{
		Alert.alert(
			'Delete class',
			'By clicking Yes, you will delete this class permanently. If you do not want to delete this class, then please press cancel.',
			[
				{
					text: 'Yes', 
					onPress: () => this.deleteClass()
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
	
	//sends class information to the server so it can be deleted on the db
	deleteClass = () => {
		fetch(IP_ADDRESS + 'deleteClass', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: this.state.accountName,
				usertype: this.state.accountType,
				classname: this.state.class_Name,
			}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			alert(responseJson['message']);
			this.props.navigation.pop();
		}).catch((error) => {
			console.error(error);
		});
	}

	onRefresh = () => {
		this.setState({
			isFetching: true
		});
		this.retrieveData();
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: '#F5FCFF',
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
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
    }, listItem:{
		marginBottom: 10,
		marginTop: 10
	}, listText:{
		fontSize: 15,
		color: '#1c1c1c'
	}
});
