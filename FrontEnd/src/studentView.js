import React, {Component} from 'react';
import {Platform, StyleSheet, ScrollView, TouchableOpacity, Text, Button, Alert, View, SectionList, TouchableHighlight} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

/*
teacher views a students list of quizzes
gives teacher an option to view the students goals overall
*/
export default class StudentView extends Component<Props> {
	constructor(props) {
		super(props);
		
		this.state ={
			loaded:'false',
			studentname:'',
			classname:'',
			data:[],
			isFetching:false,
			qTotal:0,
			usertype:''
		}
	}
	
	//retrieve list of quizzes ffrom the server for the given section
	//load them into an array, that will then be loaded into a section list
	retrieveData = async() => {
		const { navigation } = this.props;
		const studentName = navigation.getParam("studentName", "None");
		const className = navigation.getParam("className", "None");
		const userType = navigation.getParam("usertype","None");
		this.state.studentname = studentName;
		this.state.classname = className
		fetch(IP_ADDRESS + 'quizList', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				studentname: studentName,
			}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			//var j_resp = [responseJson]
			var newArray = {
				quizzes : []
			};
			
			Object.keys(responseJson).map(function(key, index) {
				var index = newArray.quizzes.findIndex(x => x.title==responseJson[key]["quizdate"])
				// here you can check specific property for an object whether it exist in your array or not

				if (index === -1){
					newArray.quizzes.push({"title": responseJson[key]["quizdate"], "data":[]});
					newArray.quizzes[newArray.quizzes.length - 1]["data"].push({"quizname":responseJson[key]["quizname"],"corrected":responseJson[key]["corrected"]})
				} else {
					newArray.quizzes[index]["data"].push({"quizname":responseJson[key]["quizname"],"corrected":responseJson[key]["corrected"]})
				}
			});
		
			var j_resp = [newArray];
			this.setState({usertype:userType});
			this.setState({data:j_resp});
			this.setState({loaded:true});
			this.setState({isFetching:false});
		})
	}
	
	componentWillMount(){
		this.retrieveData().done();
	}
	
	static navigationOptions = {
		headerTitle: "Student",
	};
	
	render() {
		if(this.state.loaded == "false"){
			return(
				<View style={styles.container}>
					<Text>Loading...</Text>
				</View>
			);
		} return (
			<View style={styles.container}>
				<ScrollView contentContainerStyle={{flexGrow: 3}}>
					<SectionList
						onRefresh={() => this.onRefresh()}
						refreshing={this.state.isFetching}
						renderItem={({item, index, section}) => 
							<TouchableHighlight
								style = {this.checkCorrectedList(item.corrected)}
								onPress={() => this.viewQuiz(item.quizname, item.corrected) }>
								<View>
									<Text key={index} style={styles.listText}>{item['quizname']}</Text>
								</View>
							</TouchableHighlight>}
						renderSectionHeader={({section: {title}}) => (
							<View style={styles.header}>
								<Text style={{fontWeight: 'bold', fontSize: 20}}>{title}</Text>
							</View>
						)}
						sections={ this.state.data[0]["quizzes"] }
						keyExtractor={(item, index) => item + index}
						ListEmptyComponent={() =>
							<View style={{backgroundColor: '#F5FCFF', justifyContent:'center'}}>
								<Text style={{textAlign:'center',fontSize: 15,color: '#1c1c1c'}}>No Quizzes To Show</Text>
							</View>
						}
					/>
				</ScrollView>
				<View style={{flex:1,alignItems: 'center', justifyContent: 'center'}}>
					<TouchableOpacity style={styles.buttonContainer} 
						onPress={() => this.viewScores() } >
						<Text  style={styles.buttonText}>VIEW SCORES</Text>
					</TouchableOpacity> 
					<TouchableOpacity style={styles.buttonContainer} 
						onPress={() => this.removeCheck() }>
						<Text  style={styles.buttonText}>REMOVE STUDENT</Text>
					</TouchableOpacity> 
				</View>
			</View>
		);
	}

	//let colour of quiz be red or green depending on the corrected state
	checkCorrectedList = (corrected) =>{
		if(corrected == true){
			return{
				backgroundColor: 'green',
				paddingBottom: 10,
				paddingTop: 10
			}
		} if(corrected == false){
			return{
				backgroundColor: 'red',
				paddingBottom: 10,
				paddingTop: 10		
			}
		}
	}
	
	//check if the teacher wants to remove the student from the class
	removeCheck = () => {
		Alert.alert(
			'Remove Student from Class',
			'By clicking Yes, you will remove this student from this class. If you do not want to remove this student, then please press cancel.',
			[
				{
					text: 'Yes', 
					onPress: () => this.removeStudent()
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
	
	//send student info to the server so that the student can be removed from the db
	removeStudent = async() => {
		alert("removed");
		fetch(IP_ADDRESS + 'removeStudent', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				studentname: this.state.studentname,
				classname: this.state.classname,
			}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			alert(responseJson['message']);
			this.props.navigation.pop();
		}).catch((error) => {
			console.error(error);
		});
	}
	
	//bring teacher to the studetns report page
	viewScores = () => {
		this.props.navigation.push('GetReportPage',{
				studentName: this.state.studentname
			});
	}
	
	//view a students quiz report when you click on a quiz in the list
	//if quiz is corrected it wil show the teacher the studetnresults
	//if quiz is not corrected will bring teacher to correction pages
	viewQuiz = (quizname, corrected) => {
		if(corrected == true){
			this.props.navigation.push('ViewQuizPage',{
				quizName: quizname,
				studentName: this.state.studentname
			});
		} else if(corrected == false){
			fetch(IP_ADDRESS + 'getQuizTotal', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					quizName: quizname
				}),
			}).then((response) => response.json())
			.then( async (responseJson) => {
				var numQuestions = responseJson['message'];
				this.setState({qTotal:numQuestions});
				this.props.navigation.push('CorrectQuizPage',{
					quizName: quizname,
					studentName: this.state.studentname,
					qnum: 1,
					totalQuestions: this.state.qTotal
				});
			}).catch((error) => {
				console.error(error);
			});
		}
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
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
	}, listText:{
		fontSize: 15,
		color: '#fff'
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
    }, header:{
		marginBottom: 10,
		marginTop: 10
	}
});
