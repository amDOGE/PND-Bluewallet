import React, { Component } from 'react'
import { View } from 'react-native'
import Modal from 'react-native-modal';
import { LightningCustodianWallet } from '../../class/lightning-custodian-wallet';
import { BitcoinUnit } from '../../models/bitcoinUnits';
import PropTypes from 'prop-types';
import { BlueSpacing20, BlueButton, SafeBlueArea, BlueCard, BlueNavigationStyle, BlueBitcoinAmount } from '../../BlueComponents';
let loc = require('../../loc');

export default class LNDPaymentModal extends Component {
  render() {
    return (
              <Modal
        isVisible={this.state.isFeeSelectionModalVisible}
        style={styles.bottomModal}
        onBackdropPress={() => this.setState({ isFeeSelectionModalVisible: false })}
      >
          <BlueSpacing20 />
          {this.state.isLoading ? (
            <View>
              <ActivityIndicator />
            </View>
          ) : (
            <BlueButton
              icon={{
                name: 'bolt',
                type: 'font-awesome',
                color: BlueApp.settings.buttonTextColor,
              }}
              title={'Pay'}
              buttonStyle={{ width: 150, left: (width - 150) / 2 - 20 }}
              onPress={() => {
                this.pay();
              }}
              disabled={this.shouldDisablePayButton()}
            />
          )}
      </Modal>
    )
  }
}
