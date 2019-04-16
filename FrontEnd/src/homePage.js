import React, {Component} from 'react';
import {AsyncStorage} from 'react-native';
import {Platform, StyleSheet, Text, Button, Image, View} from 'react-native';

type Props = {};

/*
teacher home page
shows logo
*/

export default class HomePage extends Component<Props> {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<View style={styles.container}>
				<View style={{flex:2, justifyContent:'center', alignItems: 'center'}}>
					<Image resizeMode="contain" style={styles.logo} source={require('../logo.png')} />
				</View>
				<View style={{flex:1, justifyContent:'center', alignItems: 'center'}}>
					<Text style={styles.welcome}>Welcome to ClassPal!</Text>
				</View>
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
    fontSize: 30,
    textAlign: 'center',
    margin: 10,
	color: '#1c1c1c'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },  logo: {
    position: 'absolute',
    width: 300,
	height: 150
  }
});
/*
import React from "react";
import SignedOut from "../App";

type Props = {};

export default class App extends React.Component{
	render() {
		return <SignedOut />;
	}
}*/
