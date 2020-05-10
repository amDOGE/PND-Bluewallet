import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StatusBar, TouchableOpacity, Text, StyleSheet, RefreshControl, ScrollView, Alert } from 'react-native';
import { BlueLoading, SafeBlueArea, WalletsCarousel, BlueList, BlueHeaderDefaultMain, BlueTransactionListItem } from '../../BlueComponents';
import { Icon } from 'react-native-elements';
import { NavigationEvents } from 'react-navigation';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { PlaceholderWallet } from '../../class';
import WalletImport from '../../class/walletImport';
import ViewPager from '@react-native-community/viewpager';
import ScanQRCode from '../send/ScanQRCode';
import DeeplinkSchemaMatch from '../../class/deeplink-schema-match';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
const EV = require('../../events');
const A = require('../../analytics');
/** @type {AppStorage} */
const BlueApp = require('../../BlueApp');
const loc = require('../../loc');
const BlueElectrum = require('../../BlueElectrum');

const WalletsList  = () => {
  walletsCarousel = useRef(null); 
  viewPagerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true)
  const [isFlatListRefreshControlHidden, setIsFlatListRefreshControlHidden] = useState(true)
  const [wallets, setWallets] = useState(BlueApp.getWallets().concat(false));
  const [lastSnappedTo, setLastSnappedTo] = useState(0)
  const [timeElapsed, setTimeElpased] = useState(0)
  const [cameraPreviewIsPaused, setCameraPreviewIsPaused] = useState(true);
  const [viewPagerIndex, setViewPagerIndex] = useState(1);
  const { navigate } = useNavigation();

  useEffect(() => {
    EV(EV.enum.WALLETS_COUNT_CHANGED, () => this.redrawScreen(true));
    // here, when we receive TRANSACTIONS_COUNT_CHANGED we do not query
    // remote server, we just redraw the screen
    EV(EV.enum.TRANSACTIONS_COUNT_CHANGED, this.redrawScreen);

    redrawScreen();
        // the idea is that upon wallet launch we will refresh
    // all balances and all transactions here:

    let noErr = true;
      try {
        await BlueElectrum.waitTillConnected();
        let balanceStart = +new Date();
        await BlueApp.fetchWalletBalances();
        let balanceEnd = +new Date();
        console.log('fetch all wallet balances took', (balanceEnd - balanceStart) / 1000, 'sec');
        let start = +new Date();
        await BlueApp.fetchWalletTransactions();
        let end = +new Date();
        console.log('fetch all wallet txs took', (end - start) / 1000, 'sec');
      } catch (error) {
        noErr = false;
        console.log(error);
      }
      if (noErr) this.redrawScreen();

    this.interval = setInterval(() => {
      this.setState(prev => ({ timeElapsed: prev.timeElapsed + 1 }));
    }, 60000);
    return () => clearInterval(this.interval);
  }, []);

  /**
   * Forcefully fetches TXs and balance for lastSnappedTo (i.e. current) wallet.
   * Triggered manually by user on pull-to-refresh.
   */
  const refreshTransactions = () => {
    if (!(lastSnappedTo < BlueApp.getWallets().length) && lastSnappedTo !== undefined) {
      // last card, nop
      console.log('last card, nop');
      return;
    }
    this.setState(
      {
        isFlatListRefreshControlHidden: false,
      },
      () => {
          let noErr = true;
          try {
            await BlueElectrum.ping();
            await BlueElectrum.waitTillConnected();
            let balanceStart = +new Date();
            await BlueApp.fetchWalletBalances(lastSnappedTo || 0);
            let balanceEnd = +new Date();
            console.log('fetch balance took', (balanceEnd - balanceStart) / 1000, 'sec');
            let start = +new Date();
            await BlueApp.fetchWalletTransactions(lastSnappedTo || 0);
            let end = +new Date();
            console.log('fetch tx took', (end - start) / 1000, 'sec');
          } catch (err) {
            noErr = false;
            console.warn(err);
          }
          if (noErr) await BlueApp.saveToDisk(); // caching

          redrawScreen();
      },
    );
  }

  const redrawScreen = (scrollToEnd = false) => {
    console.log('wallets/list redrawScreen()');
    if (BlueApp.getBalance() !== 0) {
      A(A.ENUM.GOT_NONZERO_BALANCE);
    } else {
      A(A.ENUM.GOT_ZERO_BALANCE);
    }

    const wallets = BlueApp.getWallets().concat(false);
    if (scrollToEnd) {
      scrollToEnd = wallets.length > wallets.length;
    }

    this.setState(
      {
        isLoading: false,
        isFlatListRefreshControlHidden: true,
        dataSource: BlueApp.getTransactions(null, 10),
        wallets: BlueApp.getWallets().concat(false),
      },
      () => {
        if (scrollToEnd) {
          walletsCarousel.snapToItem(wallets.length - 2);
        }
      },
    );
  };

  const txMemo = hash => {
    if (BlueApp.tx_metadata[hash] && BlueApp.tx_metadata[hash]['memo']) {
      return BlueApp.tx_metadata[hash]['memo'];
    }
    return '';
  }

  const handleClick = index => {
    console.log('click', index);
    let wallet = BlueApp.wallets[index];
    if (wallet) {
      if (wallet.type === PlaceholderWallet.type) {
        Alert.alert(
          loc.wallets.add.details,
          'There was a problem importing this wallet.',
          [
            {
              text: loc.wallets.details.delete,
              onPress: () => {
                WalletImport.removePlaceholderWallet();
                EV(EV.enum.WALLETS_COUNT_CHANGED);
              },
              style: 'destructive',
            },
            {
              text: 'Try Again',
              onPress: () => {
                navigate('ImportWallet', { label: wallet.getSecret() });
                WalletImport.removePlaceholderWallet();
                EV(EV.enum.WALLETS_COUNT_CHANGED);
              },
              style: 'default',
            },
          ],
          { cancelable: false },
        );
      } else {
        navigate('WalletTransactions', {
          wallet: wallet,
          key: `WalletTransactions-${wallet.getID()}`,
        });
      }
    } else {
      // if its out of index - this must be last card with incentive to create wallet
      if (!BlueApp.getWallets().some(wallet => wallet.type === PlaceholderWallet.type)) {
        navigate('AddWallet');
      }
    }
  }

  const onSnapToItem = index => {
    console.log('onSnapToItem', index);
    setLastSnappedTo(index)

    if (index < BlueApp.getWallets().length) {
      // not the last
    }

    if (wallets[index].type === PlaceholderWallet.type) {
      return;
    }

    // now, lets try to fetch balance and txs for this wallet in case it has changed
    lazyRefreshWallet(index);
  }

  /**
   * Decides whether wallet with such index shoud be refreshed,
   * refreshes if yes and redraws the screen
   * @param index {Integer} Index of the wallet.
   * @return {Promise.<void>}
   */
  const lazyRefreshWallet = useCallback(async index => {
    /** @type {Array.<AbstractWallet>} wallets */
    let wallets = BlueApp.getWallets();
    if (!wallets[index]) {
      return;
    }

    let oldBalance = wallets[index].getBalance();
    let noErr = true;
    let didRefresh = false;

    try {
      if (wallets && wallets[index] && wallets[index].type !== PlaceholderWallet.type && wallets[index].timeToRefreshBalance()) {
        console.log('snapped to, and now its time to refresh wallet #', index);
        await wallets[index].fetchBalance();
        if (oldBalance !== wallets[index].getBalance() || wallets[index].getUnconfirmedBalance() !== 0) {
          console.log('balance changed, thus txs too');
          // balance changed, thus txs too
          await wallets[index].fetchTransactions();
          this.redrawScreen();
          didRefresh = true;
        } else if (wallets[index].timeToRefreshTransaction()) {
          console.log(wallets[index].getLabel(), 'thinks its time to refresh TXs');
          await wallets[index].fetchTransactions();
          if (wallets[index].fetchPendingTransactions) {
            await wallets[index].fetchPendingTransactions();
          }
          if (wallets[index].fetchUserInvoices) {
            await wallets[index].fetchUserInvoices();
            await wallets[index].fetchBalance(); // chances are, paid ln invoice was processed during `fetchUserInvoices()` call and altered user's balance, so its worth fetching balance again
          }
          redrawScreen();
          didRefresh = true;
        } else {
          console.log('balance not changed');
        }
      }
    } catch (Err) {
      noErr = false;
      console.warn(Err);
    }

    if (noErr && didRefresh) {
      await BlueApp.saveToDisk(); // caching
    }
  })

  const _keyExtractor = (_item, index) => index.toString();

  const renderListHeaderComponent = () => {
    return (
      <View>
        <Text
          style={{
            paddingLeft: 16,
            fontWeight: 'bold',
            fontSize: 24,
            marginVertical: 8,
            color: BlueApp.settings.foregroundColor,
          }}
        >
          {loc.transactions.list.title}
        </Text>
      </View>
    );
  };

  const handleLongPress = () => {
    if (BlueApp.getWallets().length > 1 && !BlueApp.getWallets().some(wallet => wallet.type === PlaceholderWallet.type)) {
      navigate('ReorderWallets');
    } else {
      ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
    }
  };

  const onPageSelected = e => {
    const index = e.nativeEvent.position;
    StatusBar.setBarStyle(index === 1 ? 'dark-content' : 'light-content');
    setCameraPreviewIsPaused(index === 1 || index === undefined)
    setViewPagerIndex(index);
  };

  const onBarScanned = value => {
    DeeplinkSchemaMatch.navigationRouteFor({ url: value }, completionValue => {
      ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: false });
      navigate(completionValue);
    });
  };

  const _renderItem = data => {
    return (
      <View style={{ marginHorizontal: 4 }}>
        <BlueTransactionListItem item={data.item} itemPriceUnit={data.item.walletPreferredBalanceUnit} />
      </View>
    );
  };

  const renderNavigationHeader = () => {
    return (
      <View style={{ height: 44, alignItems: 'flex-end', justifyContent: 'center' }}>
        <TouchableOpacity
          testID="SettingsButton"
          style={{ marginHorizontal: 16 }}
          onPress={() => navigate('Settings')}
        >
          <Icon size={22} name="kebab-horizontal" type="octicon" color={BlueApp.settings.foregroundColor} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderLocalTrader = () => {
    if (BlueApp.getWallets().length > 0 && !BlueApp.getWallets().some(wallet => wallet.type === PlaceholderWallet.type)) {
      return (
        <TouchableOpacity
          onPress={() => {
            navigate('HodlHodl', { fromWallet: wallet });
          }}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginHorizontal: 16,
            marginVertical: 16,
            backgroundColor: '#eef0f4',
            padding: 16,
            borderRadius: 6,
          }}
        >
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0C2550' }}>Local Trader</Text>
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#9AA0AA' }}>A p2p exchange</Text>
          </View>
          <View style={{ flexDirection: 'column', backgroundColor: '#007AFF', borderRadius: 16 }}>
            <Text style={{ paddingHorizontal: 16, paddingVertical: 8, fontSize: 13, color: '#fff', fontWeight: '600' }}>New</Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  
    return isLoading ? <BlueLoading /> : 
      <SafeBlueArea>
        <View style={{ flex: 1, backgroundColor: '#ffffff' }} testID="WalletsList" accessible>
          <NavigationEvents
            onDidFocus={() => {
              this.redrawScreen();
              this.setState({ cameraPreviewIsPaused: viewPagerIndex === 1 || this.viewPagerRef.current.index === undefined });
            }}
            onWillBlur={() => this.setState({ cameraPreviewIsPaused: true })}
          />
          <ScrollView contentContainerStyle={{ flex: 1 }}>
            <ViewPager
              style={styles.wrapper}
              onPageSelected={this.onPageSelected}
              initialPage={1}
              ref={this.viewPagerRef}
              showPageIndicator={false}
            >
              <View style={styles.scanQRWrapper}>
                <ScanQRCode
                  cameraPreviewIsPaused={cameraPreviewIsPaused}
                  onBarScanned={this.onBarScanned}
                  showCloseButton={false}
                  initialCameraStatusReady={false}
                  launchedBy={state.routeName}
                />
              </View>
              <View style={styles.walletsListWrapper}>
                {this.renderNavigationHeader()}
                <ScrollView
                  refreshControl={
                    <RefreshControl onRefresh={() => this.refreshTransactions()} refreshing={!isFlatListRefreshControlHidden} />
                  }
                >
                  <BlueHeaderDefaultMain
                    leftText={loc.wallets.list.title}
                    onNewWalletPress={
                      !BlueApp.getWallets().some(wallet => wallet.type === PlaceholderWallet.type)
                        ? () => navigate('AddWallet')
                        : null
                    }
                  />
                  <WalletsCarousel
                    removeClippedSubviews={false}
                    data={wallets}
                    handleClick={index => {
                      this.handleClick(index);
                    }}
                    handleLongPress={this.handleLongPress}
                    onSnapToItem={index => {
                      this.onSnapToItem(index);
                    }}
                    ref={c => (this.walletsCarousel = c)}
                  />
                  {this.renderLocalTrader()}
                  <BlueList
                    ListHeaderComponent={this.renderListHeaderComponent}
                    ListEmptyComponent={
                      <View style={{ top: 80, height: 160 }}>
                        <Text
                          style={{
                            fontSize: 18,
                            color: '#9aa0aa',
                            textAlign: 'center',
                          }}
                        >
                          {loc.wallets.list.empty_txs1}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            color: '#9aa0aa',
                            textAlign: 'center',
                            fontWeight: '600',
                          }}
                        >
                          {loc.wallets.list.empty_txs2}
                        </Text>
                      </View>
                    }
                    data={dataSource}
                    extraData={dataSource}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                  />
                </ScrollView>
              </View>
            </ViewPager>
          </ScrollView>
        </View>
      </SafeBlueArea>
}

export default WalletsList;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  walletsListWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scanQRWrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
});