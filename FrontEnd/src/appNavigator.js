import { createStackNavigator, createAppContainer } from 'react-navigation';
import Home from './home';
import Quiz from './quiz';
import Question from './questions';
import Login from './login';
import Choose from './choose';
import SignUp from './signup';
import QuizComplete from './quizComplete';

const AppNavigator = createStackNavigator({
  Home: { screen: Home },
  Quiz: {screen: Quiz },
  Questions: {screen: Questions },
  Login: {screen: Login},
  Choose: {screen: Choose},
  SignUp: {screen: SignUp},
  QuizComplete: {screen: QuizComplete}
});

const AppNavigator = createAppContainer(RootStack);

export default AppNavigator;