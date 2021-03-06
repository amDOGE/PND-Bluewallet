import React, { useContext, useEffect, useState } from 'react';
import { Platform, View, Keyboard, StatusBar, StyleSheet, Alert } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import {
  BlueFormMultiInput,
  BlueButtonLink,
  BlueFormLabel,
  BlueDoneAndDismissKeyboardInputAccessory,
  BlueButton,
  SafeBlueArea,
  BlueSpacing20,
} from '../../BlueComponents';
import navigationStyle from '../../components/navigationStyle';
import Privacy from '../../blue_modules/Privacy';
import WalletImport from '../../class/wallet-import';
import loc from '../../loc';
import { isDesktop, isMacCatalina } from '../../blue_modules/environment';
import { BlueStorageContext } from '../../blue_modules/storage-context';

const fs = require('../../blue_modules/fs');
const encryption = require('../blue_modules/encryption');
const prompt = require('../blue_modules/prompt');
import { atob } from 'react-native-watch-connectivity/dist/base64';

const WalletsImport = () => {
  const [isToolbarVisibleForAndroid, setIsToolbarVisibleForAndroid] = useState(false);
  const route = useRoute();
  const { isImportingWallet } = useContext(BlueStorageContext);
  const label = (route.params && route.params.label) || '';
  const triggerImport = (route.params && route.params.triggerImport) || false;
  const [importText, setImportText] = useState(label);
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    root: {
      paddingTop: 40,
      backgroundColor: colors.elevated,
    },
    center: {
      flex: 1,
      marginHorizontal: 16,
      backgroundColor: colors.elevated,
    },
  });

  useEffect(() => {
    Privacy.enableBlur();
    Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setIsToolbarVisibleForAndroid(true));
    Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setIsToolbarVisibleForAndroid(false));
    return () => {
      Keyboard.removeListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide');
      Keyboard.removeListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow');
      Privacy.disableBlur();
    };
  }, []);

  useEffect(() => {
    if (triggerImport) importButtonPressed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryLegacy = async (value, isOnBarScanned) => {
    // pandacoin TODO: lower this to avoid having to base64check every input
    const cleaned = value.trim().replace(/\n/g, '');
    let importedOnce = false;
    try {
      if (atob(cleaned).startsWith("Salted")) {
        let password = false;
        do {
          // pandacoin TODO: check if pw is valid
          password = await prompt(loc.wallets.looks_like_bip38.replace("BIP38", "PND Legacy"), loc.wallets.enter_bip38_password, false);
        } while (!password);
        const decrypted = encryption.decrypt(cleaned, password);
        for (const line of decrypted.split('\n')) {
          const [mightBeWIF] = line.split(' ');
          if (!line.startsWith("#") && mightBeWIF.length > 0) {
            do {
              await importMnemonic(mightBeWIF);
              importedOnce = true;
            } while (isImportingWallet && isImportingWallet.isFailure === false)
          }
        }
      }
    } catch (e) {}
    if (importedOnce) {
      return;
    }
    if (isOnBarScanned) {
      setTimeout(() => importMnemonic(value), 500);
    } else {
      importMnemonic(value);
    }
  }

  const importButtonPressed = () => {
    if (importText.trim().length === 0) {
      return;
    }
    tryLegacy(importText);
  };

  /**
   *
   * @param importText
   */
  const importMnemonic = async importText => {
    if (isImportingWallet && isImportingWallet.isFailure === false) {
      return;
    }

    WalletImport.addPlaceholderWallet(importText);
    navigation.dangerouslyGetParent().pop();
    await new Promise(resolve => setTimeout(resolve, 500)); // giving some time to animations
    try {
      await WalletImport.processImportText(importText);
      WalletImport.removePlaceholderWallet();
    } catch (error) {
      console.log(error);
      ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
      Alert.alert(
        loc.wallets.add_details,
        loc.wallets.list_import_problem,
        [
          {
            text: loc.wallets.list_tryagain,
            onPress: () => {
              navigation.navigate('AddWalletRoot', { screen: 'ImportWallet', params: { label: importText } });
              WalletImport.removePlaceholderWallet();
            },
            style: 'default',
          },
          {
            text: loc._.cancel,
            onPress: () => {
              WalletImport.removePlaceholderWallet();
            },
            style: 'cancel',
          },
        ],
        { cancelable: false },
      );
    }
  };

  /**
   *
   * @param value
   */
  const onBarScanned = value => {
    if (value && value.data) value = value.data + ''; // no objects here, only strings
    setImportText(value);
    tryLegacy(value, true);
  };

  const importScan = () => {
    if (isMacCatalina) {
      fs.showActionSheet().then(onBarScanned);
    } else {
      navigation.navigate('ScanQRCodeRoot', {
        screen: 'ScanQRCode',
        params: {
          launchedBy: route.name,
          onBarScanned: onBarScanned,
          showFileImportButton: true,
        },
      });
    }
  };

  return (
    <SafeBlueArea style={styles.root}>
      <StatusBar barStyle="light-content" />
      <BlueSpacing20 />
      <BlueFormLabel>{loc.wallets.import_explanation}</BlueFormLabel>
      <BlueSpacing20 />
      <BlueFormMultiInput
        testID="MnemonicInput"
        value={importText}
        contextMenuHidden={!isDesktop}
        onChangeText={setImportText}
        inputAccessoryViewID={BlueDoneAndDismissKeyboardInputAccessory.InputAccessoryViewID}
      />

      <BlueSpacing20 />
      <View style={styles.center}>
        <>
          <BlueButton
            testID="DoImport"
            disabled={importText.trim().length === 0}
            title={loc.wallets.import_do_import}
            onPress={importButtonPressed}
          />
          <BlueSpacing20 />
          <BlueButtonLink title={loc.wallets.import_scan_qr} onPress={importScan} testID="ScanImport" />
        </>
      </View>
      {Platform.select({
        ios: (
          <BlueDoneAndDismissKeyboardInputAccessory
            onClearTapped={() => {
              setImportText('');
            }}
            onPasteTapped={text => {
              setImportText(text);
              Keyboard.dismiss();
            }}
          />
        ),
        android: isToolbarVisibleForAndroid && (
          <BlueDoneAndDismissKeyboardInputAccessory
            onClearTapped={() => {
              setImportText('');
              Keyboard.dismiss();
            }}
            onPasteTapped={text => {
              setImportText(text);
              Keyboard.dismiss();
            }}
          />
        ),
      })}
    </SafeBlueArea>
  );
};

WalletsImport.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.wallets.import_title }));

export default WalletsImport;
