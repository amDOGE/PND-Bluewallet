import React, { useEffect } from 'react';
import './shim.js';
import { AppRegistry } from 'react-native';
import App from './App';

const BlueAppComponent = () => {
  
  return <App />;
};

AppRegistry.registerComponent('BlueWallet', () => BlueAppComponent);
