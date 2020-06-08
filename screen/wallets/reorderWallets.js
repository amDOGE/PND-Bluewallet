import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Image, Text, StyleSheet } from 'react-native';
import { SafeBlueArea, BlueNavigationStyle } from '../../BlueComponents';
import SortableList from 'react-native-sortable-list';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import { PlaceholderWallet, LightningCustodianWallet } from '../../class';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import WalletGradient from '../../class/wallet-gradient';
const EV = require('../../events');
/** @type {AppStorage} */
const BlueApp = require('../../BlueApp');
const loc = require('../../loc/');

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  root: {
    flex: 1,
  },
  itemRoot: {
    backgroundColor: 'transparent',
    padding: 10,
    marginVertical: 17,
  },
  gradient: {
    padding: 15,
    borderRadius: 10,
    minHeight: 164,
    elevation: 5,
  },
  image: {
    width: 99,
    height: 94,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  transparentText: {
    backgroundColor: 'transparent',
  },
  label: {
    backgroundColor: 'transparent',
    fontSize: 19,
    color: '#fff',
  },
  balance: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    fontSize: 36,
    color: '#fff',
  },
  latestTxLabel: {
    backgroundColor: 'transparent',
    fontSize: 13,
    color: '#fff',
  },
  latestTxValue: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
});

const ReorderWallets = () => {
  const sortableList = useRef();
  const [hasMovedARow, setHasMovedARow] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const wallets = BlueApp.getWallets().filter(wallet => wallet.type !== PlaceholderWallet.type)
    setData(wallets);
    return () => {
      console.warn(data);
      console.warn(sortableList.current.state.data);
      if (sortableList.current.state.data.length === data.length && hasMovedARow) {
        const newWalletsOrderArray = [];
        sortableList.current.state.order.forEach(element => {
          newWalletsOrderArray.push(data[element]);
        });
        BlueApp.wallets = newWalletsOrderArray;
        BlueApp.saveToDisk().then(_success =>
          setTimeout(function () {
            EV(EV.enum.WALLETS_COUNT_CHANGED);
          }, 500),
        );
      }
    };
  }, []);

  const renderItem = (item, _active) => {
    if (!item.data) {
      return;
    }
    item = item.data;

    return (
      <View shadowOpacity={40 / 100} shadowOffset={{ width: 0, height: 0 }} shadowRadius={5} style={styles.itemRoot}>
        <LinearGradient shadowColor="#000000" colors={WalletGradient.gradientsFor(item.type)} style={styles.gradient}>
          <Image
            source={
              (LightningCustodianWallet.type === item.type && require('../../img/lnd-shape.png')) || require('../../img/btc-shape.png')
            }
            style={styles.image}
          />

          <Text style={styles.transparentText} />
          <Text numberOfLines={1} style={styles.label}>
            {item.label}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.balance}>
            {loc.formatBalance(Number(item.balance), item.preferredBalanceUnit, true)}
          </Text>
          <Text style={styles.transparentText} />
          <Text numberOfLines={1} style={styles.latestTxLabel}>
            {loc.wallets.list.latest_transaction}
          </Text>
          <Text numberOfLines={1} style={styles.latestTxValue}>
            {loc.transactionTimeToReadable(item.getLatestTransactionTime())}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const onChangeOrder = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', { ignoreAndroidSystemSettings: false });
    setHasMovedARow(true);
  };

  const onActivateRow = () => {
    ReactNativeHapticFeedback.trigger('selection', { ignoreAndroidSystemSettings: false });
  };

  const onReleaseRow = () => {
    ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: false });
  };

  return Array.isArray(data) && data.length < 1 ? (
    <View style={styles.loading}>
      <ActivityIndicator />
    </View>
  ) : (
    <SafeBlueArea>
      <SortableList
        ref={sortableList}
        style={styles.root}
        data={data}
        renderRow={renderItem}
        onChangeOrder={onChangeOrder}
        onActivateRow={onActivateRow}
        onReleaseRow={onReleaseRow}
      />
    </SafeBlueArea>
  );
};

ReorderWallets.navigationOptions = ({ navigation, route }) => ({
  ...BlueNavigationStyle(
    navigation,
    true,
    route.params && route.params.customCloseButtonFunction ? route.params.customCloseButtonFunction : undefined,
  ),
  headerTitle: loc.wallets.reorder.title,
  headerLeft: null,
});

ReorderWallets.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    setParams: PropTypes.func,
    goBack: PropTypes.func,
  }),
};

export default ReorderWallets;
