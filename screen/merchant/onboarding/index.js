import React, { Component } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import Onboarding from './src/screens/Onboarding.js';
const BlueApp = require('../../../BlueApp');

export default class OnboardingComponent extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerLeft: null,
    headerStyle: {
      backgroundColor: BlueApp.settings.brandingColor,
      borderBottomWidth: 0,
      elevation: 0,
    },
    headerRight: (
      <TouchableOpacity
        style={{ width: 40, height: 40, padding: 14 }}
        onPress={() => {
          navigation.goBack(null);
        }}
      >
        <Image style={{ alignSelf: 'center' }} source={require('../../../img/close.png')} />
      </TouchableOpacity>
    ),
  });

  render() {
    return <Onboarding />;
  }
}
