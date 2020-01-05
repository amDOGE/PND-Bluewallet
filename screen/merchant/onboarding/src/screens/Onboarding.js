/* global alert */
import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { BlueButton, SafeBlueArea, BlueSpacing20, BlueSpacing40 } from '../../../../../BlueComponents';
import nodejs from 'nodejs-mobile-react-native';
import BTCPayServerBridge, { BTCPayServerBridgeMessages } from '../../../../../class/btcpayserver';

const Onboarding = () => {
  const pairWithServer = () => {
    nodejs.start('main.js');
    nodejs.channel.addListener(
      'message',
      msg => {
        console.warn(msg);
      },
      this,
    );
    BTCPayServerBridge.generatePrivateKey();
  };

  return (
    <SafeBlueArea>
      <View style={styles.root}>
        <View style={styles.logo}>
          <View style={styles.groupRow}>
            <Image style={{ width: 60, height: 60 }} source={require('../../../../../img/qr-code.png')} />
            <Text style={styles.merchants}>merchants</Text>
          </View>
        </View>
        <View style={styles.connectToYourBtcpView}>
          <Text style={styles.connectToYourBtcp}>Connect to your BTCPay server POS store.</Text>
          <View style={styles.txNoteToSelf}>
            <View style={styles.rectangleCopy}>
              <Text style={styles.httpsYourstoreCo}>https://yourstore.com</Text>
            </View>
          </View>
          <BlueSpacing20 />
          <BlueButton onPress={pairWithServer} title="Connect" />
          <BlueSpacing40 />
        </View>
      </View>
    </SafeBlueArea>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,1)',
    justifyContent: 'space-between',
  },
  logo: {
    width: 225,
    height: 49,
    opacity: 1,
    flexDirection: 'row',
    marginTop: 54,
    marginLeft: 75,
  },
  group: {
    width: 43,
    height: 43,
    opacity: 1,
    marginTop: 2,
  },
  rectangleCopy1_imageStyle: {},
  rectangleCopy2: {
    top: 10,
    left: 0,
    width: 43,
    height: 32,
    backgroundColor: 'transparent',
    position: 'absolute',
    opacity: 1,
    borderRadius: 9,
    overflow: 'hidden',
  },
  rectangleCopy2_imageStyle: {},
  rectangleCopy3: {
    top: 20,
    left: 0,
    width: 43,
    height: 23,
    backgroundColor: 'transparent',
    position: 'absolute',
    opacity: 1,
    borderRadius: 9,
    overflow: 'hidden',
  },
  rectangleCopy3_imageStyle: {},
  path: {
    width: 17,
    height: 7,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    marginTop: 8,
  },
  rectangleCopy1Stack: {
    width: 43,
    height: 43,
  },
  merchants: {
    backgroundColor: 'transparent',
    color: 'rgba(12,37,80,1)',
    opacity: 1,
    fontSize: 40,
    letterSpacing: -0.17,
    textAlign: 'center',
    marginLeft: 8,
  },
  groupRow: {
    height: 45,
    flexDirection: 'row',
    flex: 1,
    marginTop: 4,
  },
  connectToYourBtcpView: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  connectToYourBtcp: {
    backgroundColor: 'transparent',
    color: 'rgba(129,134,142,1)',
    opacity: 1,
    fontSize: 14,
    letterSpacing: -0.66,
  },
  txNoteToSelf: {
    width: 327,
    height: 44,
    opacity: 1,
    marginTop: 26,
  },
  rectangleCopy: {
    width: 327,
    height: 44,
    backgroundColor: 'rgba(245,245,245,1)',
    opacity: 1,
    borderRadius: 4,
    borderColor: 'rgba(210,210,210,1)',
    borderWidth: 1,
  },
  httpsYourstoreCo: {
    backgroundColor: 'transparent',
    color: 'rgba(129,134,142,1)',
    opacity: 1,
    fontSize: 14,
    letterSpacing: -0.66,
    marginTop: 14,
    marginLeft: 16,
  },
  actions: {
    width: 263,
    height: 48,
    opacity: 1,
    marginTop: 24,
  },
  rectangle2: {
    width: 263,
    height: 48,
    backgroundColor: 'rgba(204,221,249,1)',
    opacity: 1,
    borderRadius: 38,
  },
  connect: {
    backgroundColor: 'transparent',
    color: 'rgba(47,95,179,1)',
    opacity: 1,
    fontSize: 15,
    letterSpacing: -0.36,
    marginTop: 15,
  },
});

export default Onboarding;
