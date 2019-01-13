/* global alert */
import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';
import { SafeBlueArea, BlueNavigationStyle } from '../../BlueComponents';
const loc = require('../../loc');
const coinATMRadarURL = 'https://coinatmradar.com/mapframe/?key=bluewallet_9d48e5cf62025b1f3bef2e47cfdda71d9acecc3a';

export default class ATMFinder extends Component {
  static navigationOptions = ({ navigation }) => ({
    ...BlueNavigationStyle(),
    title: loc.settings.findAnATM,
  });

  onError = _error => {
    alert('An error was encountered when trying to load the content. Please, verify your network connection and try again.');
    this.props.navigation.goBack();
  };

  render() {
    return (
      <SafeBlueArea>
        <WebView
          useWebKit={false}
          scalesPageToFit
          source={{
            html: `<iframe style="width:100%; height:100%" src="${coinATMRadarURL}" frameborder="0"></iframe>`,
          }}
          geolocationEnabled
          
          style={{ flex: 1, marginTop: 20 }}
          onError={this.onError}
        />
      </SafeBlueArea>
    );
  }
}

ATMFinder.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func,
  }),
};
