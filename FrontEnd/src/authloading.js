import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

/*
initial screen which checks if a user is logged in or not 
checks if they have a user token stored on their device
if theyre logged in, send them to app stack
if theyre not logged in send them to auth stack to log in or create an account
*/
export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to the appropriate stack
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');
	const userType = await AsyncStorage.getItem('userType');

	if(userToken != null){
		if(userType == 'student'){
			this.props.navigation.navigate('StudentApp')
		} else if(userType == 'teacher'){
			this.props.navigation.navigate('TeacherApp')
		} else {
			this.props.navigation.navigate('Auth')
		}
	} else {
		this.props.navigation.navigate('Auth')
	}
  };

  // Render loading content
  render() {
    return (
      <View>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}