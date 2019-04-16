import React, {Component} from 'react';
import {Platform, StyleSheet, ScrollView, TouchableOpacity, Text, Button, Alert, View, SectionList, TouchableHighlight} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

/*
get list of quizzes for a student
*/
export default class QuizList extends Component<Props> {
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
	
	//retrieve quiz list from the server fr a given student
	//put repose JSON object into an array which will be loaded into a list
	retrieveData = async() => {
		const { navigation } = this.props;
		const studentName = navigation.getParam("studentName", "");
		this.state.studentname = studentName;
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
			var newArray = {
				quizzes : []
			};
			
			Object.keys(responseJson).map(function(key, index) {
				var index = newArray.quizzes.findIndex(x => x.title==responseJson[key]["quizdate"])

				if (index === -1){
					newArray.quizzes.push({"title": responseJson[key]["quizdate"], "data":[]});
					newArray.quizzes[newArray.quizzes.length - 1]["data"].push({"quizname":responseJson[key]["quizname"],"corrected":responseJson[key]["corrected"]})
				} else {
					newArray.quizzes[index]["data"].push({"quizname":responseJson[key]["quizname"],"corrected":responseJson[key]["corrected"]})
				}
			});
		
			var j_resp = [newArray];
			this.setState({data:j_resp});
			alert(this.state.data[0]['quizzes'][0]['title']);
			this.setState({isFetching:false});
			this.setState({loaded:true});
		});
	}
	
	componentWillMount(){
		this.retrieveData().done();
	}
	
	static navigationOptions = {
		headerTitle: "Quiz List",
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
				</View>
			</View>
		);
	}

	//check if quiz is corrected or not and based off this change color to red or green
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
	
	//bring to report page
	viewScores = () => {
		this.props.navigation.push('GetReportPage',{
			studentName: this.state.studentname
		});
	}
	
	//view a given quiz
	viewQuiz = (quizname, corrected) => {
		if(corrected == true){
			this.props.navigation.push('GetReportPage',{
				quizName: quizname,
				studentName: this.state.studentname
			});
		} else if(corrected == false){
			alert('Sorry this Quiz has not been corrected by your teacher yet! Please wait for them to review it!')
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