// Rename this sample file to main.js to use on your project.
// The main.js file will be overwritten in updates/reinstalls.
const btcpay = require('btcpay');
const rnBridge = require('rn-bridge');
const BTCPayServerBridgeMessages = {
  GenerateKeyPair: 'GenerateKeyPair',
};
// Echo every message received from react-native.
rnBridge.channel.on('message', msg => {
  if (msg === BTCPayServerBridgeMessages.GenerateKeyPair) {
    const privateKey = btcpay.crypto.generate_keypair();
    rnBridge.channel.send(privateKey);
  }
});

// Inform react-native node is initialized.
rnBridge.channel.send('Node was initialized.');
