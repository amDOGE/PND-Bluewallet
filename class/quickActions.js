/* global alert */
import QuickActions from 'react-native-quick-actions';

export default class DeviceQuickActions {
  static async setQuickActions(wallets) {
    const BlueApp = require('../BlueApp');
    const loc = require('../loc');
    if (await BlueApp.storageIsEncrypted()) {
      DeviceQuickActions.clearShortcutItems();
    } else {
      QuickActions.isSupported((error, supported) => {
        if (!wallets) {
          wallets = BlueApp.getWallets();
        }
        if (error) {
          alert(error);
        } else {
          if (supported) {
            let shortcutItems = [];
            for (const wallet of wallets) {
              shortcutItems.push({
                type: 'Wallets', // Required
                title: wallet.getLabel(), // Optional, if empty, `type` will be used instead
                subtitle: wallet.hideBalance
                  ? ''
                  : `${loc.formatBalance(Number(wallet.getBalance()), wallet.getPreferredBalanceUnit(), true)}`,
                userInfo: {
                  url: `bluewallet://wallet/${wallet.getID()}`, // Provide any custom data like deep linking URL
                },
              });
            }
            QuickActions.setShortcutItems(shortcutItems);
          }
        }
      });
    }
  }

  static clearShortcutItems() {
    QuickActions.clearShortcutItems();
  }
}
