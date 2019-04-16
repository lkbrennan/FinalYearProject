import React, {Component} from 'react';
import {Platform, StyleSheet, ScrollView, TouchableOpacity, Text, Button, View, FlatList, AsyncStorage, TouchableHighlight} from 'react-native';
import {IP_ADDRESS} from './globalVars';

type Props = {};

/*
view list of classes for a user
*/

export default class ClassList extends Component<Props> {
	constructor(props) {
		super(props);
		this.state = {
			isFetching:false,
			data:[],
			userName: "",
			loaded:'false'
		};
	}
	
	//retrieve data from the server for the classlist
	//iterates through the returned JSON object and put into an Array
	//which is then put into a list
	retrieveData = async() => {
		this.state.userName = await AsyncStorage.getItem('userName');
		fetch(IP_ADDRESS + 'classList', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: this.state.userName,
			}),
		}).then((response) => response.json())
		.then( async (responseJson) => {
			//var j_resp = [responseJson]
			var newArray = {
				classes : []
			};
			Object.keys(responseJson).map(function(key, index) {
				newArray.classes.push({
					"classname" : responseJson[key]["classname"],
					"id" : responseJson[key]["id"]
				});
			});
			
			j_resp = [newArray];
			//console.log(myObject);
			this.setState({data: j_resp});
			this.setState({isFetching:false})
			this.setState({loaded: 'true'});
		}).catch((error) => {
			console.error(error);
		});
	}
	
	componentWillMount() {
		this.retrieveData().done();
	}
	
	static navigationOptions = {
		headerTitle: 'Classes',
	};
  
	//render list of classes
	render() {
		if (this.state.loaded === 'false') {
			return (
				<View style={styles.container}>
					<Text>Loading...</Text>
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<ScrollView contentContainerStyle={{flexGrow : 5}}>
					<FlatList
						data={this.state.data[0]["classes"]}
						onRefresh={() => this.onRefresh()}
						refreshing={this.state.isFetching}
						keyExtractor={(x,i)=>i}
						renderItem={({item}) => 
							<TouchableHighlight
								style={styles.listItem}
								onPress={() => this.goToClass(item.classname) }>
								<View style={{backgroundColor: '#F5FCFF'}}>
									<Text style={styles.listText}>{item.classname}</Text>
								</View>
							</TouchableHighlight>
						}
						ListEmptyComponent={() =>
							<View style={{backgroundColor: '#F5FCFF', justifyContent:'center'}}>
								<Text style={{textAlign:'center',fontSize: 15,color: '#1c1c1c'}}>No Classes To Show</Text>
							</View>
						}
					/>
				</ScrollView>
				<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
					<TouchableOpacity style={styles.buttonContainer} 
						onPress={() => this.addClass()} >
						<Text  style={styles.buttonText}>ADD CLASS</Text>
					</TouchableOpacity> 
				</View>
			</View>
		);}
		
	//if class is clicked on,go to class page
	goToClass = (classname) => {
		this.props.navigation.push('StudentsPage',{
				className: classname
		});
		//alert(classname);
	}
	
	//add a class tho the class list
	addClass = () => {
		this.props.navigation.push('AddClassPage');
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
	},buttonContainer:{
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
