import React, { Component } from 'react';
import { View, TouchableOpacity, NativeEventEmitter, NativeModules, Text, FlatList, InteractionManager, RefreshControl, ScrollView } from 'react-native';
import { BlueLoading, SafeBlueArea, WalletsCarousel, BlueList, BlueHeaderDefaultMain, BlueTransactionListItem } from '../../BlueComponents';
import { Icon } from 'react-native-elements';
import { NavigationEvents } from 'react-navigation';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import PropTypes from 'prop-types';
import WalletGradient from '../../class/walletGradient';
import OnAppLaunch from '../../class/onAppLaunch';
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
let EV = require('../../events');
let A = require('../../analytics');
/** @type {AppStorage} */
let BlueApp = require('../../BlueApp');
let loc = require('../../loc');
let BlueElectrum = require('../../BlueElectrum');

export default class WalletsList extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerStyle: {
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 0,
      elevation: 0,
    },
    headerRight: (
      <TouchableOpacity
        style={{ marginHorizontal: 16, width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' }}
        onPress={() => navigation.navigate('Settings')}
      >
        <Icon size={22} name="kebab-horizontal" type="octicon" color={BlueApp.settings.foregroundColor} />
      </TouchableOpacity>
    ),
  });

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isFlatListRefreshControlHidden: true,
      wallets: BlueApp.getWallets().concat(false),
      lastSnappedTo: 0,
      scanning:false,
      peripherals: new Map(),
    };
    EV(EV.enum.WALLETS_COUNT_CHANGED, this.redrawScreen.bind(this));

    // here, when we receive TRANSACTIONS_COUNT_CHANGED we do not query
    // remote server, we just redraw the screen
    EV(EV.enum.TRANSACTIONS_COUNT_CHANGED, this.redrawScreen.bind(this));

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  componentDidMount() {
    
    BleManager.start({showAlert: true}).then((result) =>  this.startScan());

    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );


    this.redrawScreen();
    // the idea is that upon wallet launch we will refresh
    // all balances and all transactions here:
    InteractionManager.runAfterInteractions(async () => {
      const isViewAllWalletsEnabled = await OnAppLaunch.isViewAllWalletsEnabled();
      if (!isViewAllWalletsEnabled) {
        const selectedDefaultWallet = await OnAppLaunch.getSelectedDefaultWallet();
        const walletIndex = this.state.wallets.findIndex(wallet => wallet.getID() === selectedDefaultWallet.getID());
        this.handleClick(walletIndex);
      }

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
      } catch (_) {
        noErr = false;
      }
      if (noErr) this.redrawScreen();
    });
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({peripherals});
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  handleStopScan() {
    console.log('Scan is stopped');
    this.setState({ scanning: false });
  }

  startScan() {
    if (!this.state.scanning) {
      console.warn('HERE')
      //this.setState({peripherals: new Map()});
      BleManager.scan([], 3, true).then((results) => {
        console.log('Scanning...');
        console.warn(results)
        BleManager.connect('3EE7D2BD-0D0E-BBEC-7FC4-F53BBB23F6BB')
  .then(() => {
    // Success code
    console.log('Connected');
  })
  .catch((error) => {
    // Failure code
    console.log(error);
  });
        this.setState({scanning:true});
      });
    }
  }

  retrieveConnected(){
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length == 0) {
        console.log('No connected peripherals')
      }
      console.log(results);
      var peripherals = this.state.peripherals;
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({ peripherals });
      }
    });
  }


  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        console.log('Connected peripherals: ' + peripheralsArray.length);
      });
    }
    this.setState({appState: nextAppState});
  }

  handleDiscoverPeripheral(peripheral){
    var peripherals = this.state.peripherals;
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    this.setState({ peripherals });
  }

  test(peripheral) {
    if (peripheral){
      if (peripheral.connected){
        BleManager.disconnect(peripheral.id);
      }else{
        BleManager.connect(peripheral.id).then(() => {
          let peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            this.setState({peripherals});
          }
          console.log('Connected to ' + peripheral.id);


          setTimeout(() => {

            /* Test read current RSSI value
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              console.log('Retrieved peripheral services', peripheralData);
              BleManager.readRSSI(peripheral.id).then((rssi) => {
                console.log('Retrieved actual RSSI value', rssi);
              });
            });*/

            // Test using bleno's pizza example
            // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log(peripheralInfo);
              var service = '13333333-3333-3333-3333-333333333337';
              var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
              var crustCharacteristic = '13333333-3333-3333-3333-333333330001';

              setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                  console.log('Started notification on ' + peripheral.id);
                  setTimeout(() => {
                    BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                      console.log('Writed NORMAL crust');
                      BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
                        console.log('Writed 351 temperature, the pizza should be BAKED');
                        /*
                        var PizzaBakeResult = {
                          HALF_BAKED: 0,
                          BAKED:      1,
                          CRISPY:     2,
                          BURNT:      3,
                          ON_FIRE:    4
                        };*/
                      });
                    });

                  }, 500);
                }).catch((error) => {
                  console.log('Notification error', error);
                });
              }, 200);
            });

          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }
  }

  /**
   * Forcefully fetches TXs and balance for lastSnappedTo (i.e. current) wallet.
   * Triggered manually by user on pull-to-refresh.
   */
  refreshTransactions() {
    if (!(this.lastSnappedTo < BlueApp.getWallets().length) && this.lastSnappedTo !== undefined) {
      // last card, nop
      console.log('last card, nop');
      return;
    }
    this.setState(
      {
        isFlatListRefreshControlHidden: false,
      },
      () => {
        InteractionManager.runAfterInteractions(async () => {
          let noErr = true;
          try {
            await BlueElectrum.ping();
            await BlueElectrum.waitTillConnected();
            let balanceStart = +new Date();
            await BlueApp.fetchWalletBalances(this.lastSnappedTo || 0);
            let balanceEnd = +new Date();
            console.log('fetch balance took', (balanceEnd - balanceStart) / 1000, 'sec');
            let start = +new Date();
            await BlueApp.fetchWalletTransactions(this.lastSnappedTo || 0);
            let end = +new Date();
            console.log('fetch tx took', (end - start) / 1000, 'sec');
          } catch (err) {
            noErr = false;
            console.warn(err);
          }
          if (noErr) await BlueApp.saveToDisk(); // caching

          this.redrawScreen();
        });
      },
    );
  }

  redrawScreen() {
    console.log('wallets/list redrawScreen()');
    if (BlueApp.getBalance() !== 0) {
      A(A.ENUM.GOT_NONZERO_BALANCE);
    }

    this.setState({
      isLoading: false,
      isFlatListRefreshControlHidden: true,
      dataSource: BlueApp.getTransactions(null, 10),
      wallets: BlueApp.getWallets().concat(false),
    });
  }

  txMemo(hash) {
    if (BlueApp.tx_metadata[hash] && BlueApp.tx_metadata[hash]['memo']) {
      return BlueApp.tx_metadata[hash]['memo'];
    }
    return '';
  }

  handleClick(index) {
    console.log('click', index);
    let wallet = BlueApp.wallets[index];
    if (wallet) {
      this.props.navigation.navigate('WalletTransactions', {
        wallet: wallet,
        headerColor: WalletGradient.headerColorFor(wallet.type),
      });
    } else {
      // if its out of index - this must be last card with incentive to create wallet
      this.props.navigation.navigate('AddWallet');
    }
  }

  onSnapToItem(index) {
    console.log('onSnapToItem', index);
    this.lastSnappedTo = index;
    this.setState({ lastSnappedTo: index });

    if (index < BlueApp.getWallets().length) {
      // not the last
    }

    // now, lets try to fetch balance and txs for this wallet in case it has changed
    this.lazyRefreshWallet(index);
  }

  /**
   * Decides whether wallet with such index shoud be refreshed,
   * refreshes if yes and redraws the screen
   * @param index {Integer} Index of the wallet.
   * @return {Promise.<void>}
   */
  async lazyRefreshWallet(index) {
    /** @type {Array.<AbstractWallet>} wallets */
    let wallets = BlueApp.getWallets();
    if (!wallets[index]) {
      return;
    }

    let oldBalance = wallets[index].getBalance();
    let noErr = true;
    let didRefresh = false;

    try {
      if (wallets && wallets[index] && wallets[index].timeToRefreshBalance()) {
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
          this.redrawScreen();
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
  }

  _keyExtractor = (_item, index) => index.toString();

  renderListHeaderComponent = () => {
    return (
      <View>
        <Text
          style={{
            paddingLeft: 15,
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

  handleLongPress = () => {
    if (BlueApp.getWallets().length > 1) {
      this.props.navigation.navigate('ReorderWallets');
    } else {
      ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
    }
  };

  _renderItem = data => {
    return <BlueTransactionListItem item={data.item} itemPriceUnit={data.item.walletPreferredBalanceUnit} />;
  };
  render() {
    if (this.state.isLoading) {
      return <BlueLoading />;
    }
    return (
      <SafeBlueArea style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <NavigationEvents
          onWillFocus={() => {
            this.redrawScreen();
          }}
        />
        <ScrollView
          refreshControl={
            <RefreshControl onRefresh={() => this.refreshTransactions()} refreshing={!this.state.isFlatListRefreshControlHidden} />
          }
        >
          <BlueHeaderDefaultMain leftText={loc.wallets.list.title} onNewWalletPress={() => this.props.navigation.navigate('AddWallet')} />
          <WalletsCarousel
            data={this.state.wallets}
            handleClick={index => {
              this.handleClick(index);
            }}
            handleLongPress={this.handleLongPress}
            onSnapToItem={index => {
              this.onSnapToItem(index);
            }}
          />
          <BlueList>
            <FlatList
              ListHeaderComponent={this.renderListHeaderComponent}
              ListEmptyComponent={
                <View style={{ top: 50, height: 100 }}>
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
                    }}
                  >
                    {loc.wallets.list.empty_txs2}
                  </Text>
                </View>
              }
              data={this.state.dataSource}
              extraData={this.state.dataSource}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
          </BlueList>
        </ScrollView>
      </SafeBlueArea>
    );
  }
}

WalletsList.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
};
