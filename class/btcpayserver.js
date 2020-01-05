import nodejs from 'nodejs-mobile-react-native';

export const BTCPayServerBridgeMessages = {
  GenerateKeyPair: 'GenerateKeyPair',
};

export default class BTCPayServerBridge {
  static generatePrivateKey(completionHandler = () => {}) {
    nodejs.channel.send(BTCPayServerBridgeMessages.GenerateKeyPair);
  }
}
