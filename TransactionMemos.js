import { AsyncStorage } from 'react-native';
import iCloudStorage from 'react-native-icloudstore';
/** @type {AppStorage} */
let BlueApp = require('./BlueApp');

export default class TransactionMemos {
  static TransactionMemosKey = 'TransactionMemosKey';

  static async isCloudSyncEnabled() {
    const isCloudSyncEnabled = (await AsyncStorage.getItem(TransactionMemos.TransactionMemosKey)) || false;
    return isCloudSyncEnabled;
  }

  static async setCloudSyncState(state) {
    return AsyncStorage.setItem(TransactionMemos.TransactionMemosKey, state);
  }

  static async getTransactionMemo(forBlockHeight, forHash) {
    if (typeof forHash === 'string') {
      if (TransactionMemos.isCloudSyncEnabled()) {
        const memo = await iCloudStorage.getItem(forBlockHeight);
        return memo[forHash];
      } else {
        if (BlueApp.tx_metadata[forHash]) {
          if (BlueApp.tx_metadata[forHash]['memo']) {
            return BlueApp.tx_metadata[forHash]['memo'];
          }
        }
      }
    }
  }

  static async setTransactionMemo(forBlockHeight, forHash, memo) {
    if (TransactionMemos.isCloudSyncEnabled()) {
      let hashWithMemo = {};
      hashWithMemo[forHash] = memo;
      return iCloudStorage.setItem(forBlockHeight, JSON.stringify(hashWithMemo));
    } else {
      return BlueApp.tx_metadata[forHash]['memo'];
    }
  }
}
