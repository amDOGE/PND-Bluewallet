/* global alert */
import React, { Component } from 'react';
import {
  ActivityIndicator,
  View,
  TextInput,
  Alert,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {
  BlueCreateTxNavigationStyle,
  BlueButton,
  BlueBitcoinAmount,
  BlueAddressInput,
  BlueDismissKeyboardInputAccessory,
  BlueLoading,
  BlueUseAllFundsButton,
  BlueListItem,
  BlueText, BlueSpacing,
} from '../../BlueComponents';
import Slider from '@react-native-community/slider';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import NetworkTransactionFees, { NetworkTransactionFee } from '../../models/networkTransactionFees';
import BitcoinBIP70TransactionDecode from '../../bip70/bip70';
import { BitcoinUnit, Chain } from '../../models/bitcoinUnits';
import { AppStorage, HDSegwitBech32Wallet, LightningCustodianWallet, WatchOnlyWallet } from '../../class';
import Azteco from '../../class/azteco';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { BitcoinTransaction } from '../../models/bitcoinTransactionInfo';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import DeeplinkSchemaMatch from '../../class/deeplink-schema-match';
const bitcoin = require('bitcoinjs-lib');
let BigNumber = require('bignumber.js');
const { width } = Dimensions.get('window');
const EV = require('../../events');
let BlueApp: AppStorage = require('../../BlueApp');
let loc = require('../../loc');

export default class AztecoRedeem extends Component {
  static navigationOptions = ({ navigation }) => ({
    ...BlueCreateTxNavigationStyle(navigation),
    title: 'Redeem Azte.co voucher',
  });

  state = { isLoading: true };

  constructor(props) {
    super(props);

    /** @type {LegacyWallet} */
    let fromWallet = null;

    const wallets = BlueApp.getWallets().filter(wallet => wallet.type !== LightningCustodianWallet.type);

    if (wallets.length === 0) {
      alert('Before redeeming you must first add a Bitcoin wallet.');
      return props.navigation.goBack(null);
    } else {
      if (wallets.length > 0) {
        fromWallet = wallets[0];
      }
      this.state = {
        c1: props.navigation.state.params.c1,
        c2: props.navigation.state.params.c2,
        c3: props.navigation.state.params.c3,
        c4: props.navigation.state.params.c4,
        isLoading: false,
        fromWallet,
        renderWalletSelectionButtonHidden: false,
      };
    }
  }

  async componentDidMount() {
    console.log('AztecoRedeem - componentDidMount');
  }

  componentWillUnmount() {}

  onWalletSelect = wallet => {
    this.setState({ fromWallet: wallet }, () => {
      this.props.navigation.pop();
      console.warn(wallet)
    });
  };

  redeem = async () => {
    const address = await this.state.fromWallet.getAddressAsync();
    const azteco = new Azteco();
    alert(address + this.state.c4);
    const result = await azteco.redeem([this.state.c1, this.state.c2, this.state.c3, this.state.c1], address);
    if (!result) {
      alert('Something went wrong. Is this voucher still valid?');
    } else {
      alert('Success');
      EV(EV.enum.REMOTE_TRANSACTIONS_COUNT_CHANGED); // remote because we want to refetch from server tx list and balance
      this.state.navigation.goBack(null);
    }
  }

  renderWalletSelectionButton = () => {
    if (this.state.renderWalletSelectionButtonHidden) return;
    return (
      <View style={{ marginBottom: 24, alignItems: 'center' }}>
        {!this.state.isLoading && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() =>
              this.props.navigation.navigate('SelectWallet', { onWalletSelect: this.onWalletSelect, chainType: Chain.ONCHAIN })
            }
          >
            <Text style={{ color: '#9aa0aa', fontSize: 14, marginRight: 8 }}>{"Redeem to wallet"}</Text>
            <Icon name="angle-right" size={18} type="font-awesome" color="#9aa0aa" />
          </TouchableOpacity>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() =>
              this.props.navigation.navigate('SelectWallet', { onWalletSelect: this.onWalletSelect, chainType: Chain.ONCHAIN })
            }
          >
            <Text style={{ color: '#0c2550', fontSize: 14 }}>{this.state.fromWallet.getLabel()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    if (this.state.isLoading || typeof this.state.fromWallet === 'undefined') {
      return (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <BlueLoading />
        </View>
      );
    }
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
          <View style={{ alignItems: 'center', alignContent: 'flex-end', marginBottom: 120, marginTop: 66 }}>
            <Text>Your voucher code is</Text>
            <Text>
              {this.state.c1}-{this.state.c2}-{this.state.c3}-{this.state.c4}
            </Text>

            <BlueSpacing />
            {this.renderWalletSelectionButton()}
            <BlueSpacing />

            <BlueButton onPress={this.redeem} title={"Redeem"} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

AztecoRedeem.propTypes = {
  navigation: PropTypes.shape({
    pop: PropTypes.func,
    goBack: PropTypes.func,
    navigate: PropTypes.func,
    getParam: PropTypes.func,
    setParams: PropTypes.func,
    state: PropTypes.shape({
      routeName: PropTypes.string,
      params: PropTypes.shape({
        amount: PropTypes.number,
        address: PropTypes.string,
        satoshiPerByte: PropTypes.string,
        fromWallet: PropTypes.fromWallet,
        memo: PropTypes.string,
        uri: PropTypes.string,
      }),
    }),
  }),
};
