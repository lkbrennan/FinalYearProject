import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createSwitchNavigator, createStackNavigator, createAppContainer,createBottomTabNavigator } from 'react-navigation';
import HomePage from './src/homePage';
import Home from './src/home';
import Quiz from './src/quiz';
import Questions from './src/questions';
import Login from './src/login';
import Choose from './src/choose';
import SignUp from './src/signup';
import QuizComplete from './src/quizComplete';
import AuthLoadingScreen from './src/authloading';
import Account from './src/accountInfo';
import ClassList from './src/classList';
import InputQuestions from './src/inputQuestions';
import StudentList from './src/studentList';
import AddClass from './src/addClass';
import StudentView from './src/studentView';
import ViewQuiz from './src/viewQuiz';
import CorrectQuiz from  './src/correctQuiz';
import CorrectionComplete from './src/correctionsComplete';
import QuizList from './src/quizList';
import GetReport from './src/getReport';

//creation of the tab navigator at the bottom of the screen
const TabNavigator = createBottomTabNavigator({
		Account: Account,
		StudentHome: Home,
		Class: ClassList,
	},
	{
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Ionicons;
        let iconName;
        if (routeName === 'Home') {
          iconName = `ios-information-circle${focused ? '' : '-outline'}`;
        } else if (routeName === 'Account') {
          iconName = `ios-options`;
        } else if (routeName === 'Class') {
          iconName = `ios-options`;
        }

        // You can return any component that you like here!
        return <IconComponent name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
  }
);

const TeacherTabNavigator = createBottomTabNavigator({
		Account: Account,
		Home: HomePage,
		Class: ClassList,
	},
	{
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Ionicons;
        let iconName;
        if (routeName === 'Home') {
          iconName = `ios-information-circle${focused ? '' : '-outline'}`;
        } else if (routeName === 'Account') {
          iconName = `ios-options`;
        } else if (routeName === 'Class') {
          iconName = `ios-options`;
        }

        // You can return any component that you like here!
        return <IconComponent name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
  }
);

//initiliasing stack views
//auth view will be accessed if user access token is not found in users async storage
//otherwise the user will be brought to either the student or teacher app stack depending on their account type
const TeacherAppStack = createStackNavigator({ 
	Tabs: TeacherTabNavigator, 
	AccountPage: Account, 
	Home: HomePage, 
	ClassPage: ClassList,
	StudentsPage: StudentList,
	AddClassPage: AddClass,
	StudentViewPage: StudentView,
	ViewQuizPage: ViewQuiz,
	CorrectQuizPage:CorrectQuiz,
	CorrectionCompletePage:CorrectionComplete,
	GetReportPage: GetReport
});
const AuthStack = createStackNavigator({ 
	LogInPage: Login , 
	SignUpPage : SignUp
});
const StudentAppStack = createStackNavigator({ 
	Tabs: TabNavigator, 
	AccountPage: Account, 
	StudentHome: HomePage, 
	QuizPage: Quiz, 
	QuestionPage: Questions, 
	InputQuestionPage: InputQuestions,
	QuizComplete: QuizComplete, 
	ClassPage: ClassList,
	StudentsPage: StudentList,
	AddClassPage: AddClass,
	ViewQuizPage: ViewQuiz,
	QuizListPage: QuizList,
	GetReportPage: GetReport
});

//hide tab bar in authentication screens
AuthStack.navigationOptions = ({ navigation }) => {
	let tabBarVisible = false;
	return {
		tabBarVisible,
	};
};

//create the app stack container
export default createAppContainer(createSwitchNavigator(
	{
		AuthLoading: AuthLoadingScreen,
		StudentApp: StudentAppStack,
		TeacherApp: TeacherAppStack,
		Auth: AuthStack,
	},
	{
		initialRouteName: 'AuthLoading',
		defaultNavigationOptions: {
			titleStyle: {
				textAlign: 'center'
			},
		},
	}
));
