import React, { useEffect, useState } from 'react';
import { View, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { BlueTextCentered } from '../BlueComponents';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import NetInfo from '@react-native-community/netinfo';

const NetworkActivityModalStatusString = Object.freeze({
  INTERNET_UNREACHABLE: 'No Internet Connection available. Some features may be unavailable. Please, verify your network connectivity.',
  ELECTRUM_CONNECTING: 'Connecting to the Bitcoin Network. Please Wait...',
});

export const NetworkActivityModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');

  useEffect(() => {
    NetInfo.fetch().then(handleNetworkState);
    const unsubscribe = NetInfo.addEventListener(handleNetworkState);
    return () => unsubscribe();
  });

  const handleNetworkState = state => {
    setModalText(NetworkActivityModalStatusString.INTERNET_UNREACHABLE);
    if (state.isInternetReachable) {
      setIsModalVisible(false);
    } else {
      setIsModalVisible(true);
      ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: false });
    }
  };

  return isModalVisible ? (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : null}>
      <View style={styles.networkActivityModalContent}>
        <BlueTextCentered>{modalText}</BlueTextCentered>
      </View>
    </KeyboardAvoidingView>
  ) : null;
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 200,
    height: 200,
  },
  networkActivityModalContent: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modelContentButtonLayout: {
    flexDirection: 'row',
    margin: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});
