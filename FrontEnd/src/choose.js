import React, {Component} from 'react';
import {Platform, StyleSheet, Text, Button, View} from 'react-native';

type Props = {};

export default class Choose extends Component<Props> {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>What would you like to do?</Text>
				<Button
					onPress={() =>
						this.props.navigation.navigate('Login')
					}
					title="Login"
					color="#33cc33"
				/>
				<Button
					onPress={() =>
						this.props.navigation.navigate('SignUp')
					}
					title="Sign Up"
					color="#33cc33"
				/>
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
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
