const BlueElectrum = require('../blue_modules/BlueElectrum');

export const NetworkTransactionFeeType = Object.freeze({
  FAST: 'Fast',
  MEDIUM: 'MEDIUM',
  SLOW: 'SLOW',
  CUSTOM: 'CUSTOM',
});

export class NetworkTransactionFee {
  static StorageKey = 'NetworkTransactionFee';

  constructor(fastestFee = 1, mediumFee = 1, slowFee = 1) {
    this.fastestFee = fastestFee;
    this.mediumFee = mediumFee;
    this.slowFee = slowFee;
  }
}

export default class NetworkTransactionFees {
  static recommendedFees() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      try {
        const response = await BlueElectrum.estimateFees();
        if (typeof response === 'object') {
          const networkFee = new NetworkTransactionFee(10500, 10500, 10500);
          resolve(networkFee);
        } else {
          const networkFee = new NetworkTransactionFee(10500, 10500, 10500);
          resolve(networkFee);
        }
      } catch (err) {
        console.warn(err);
        const networkFee = new NetworkTransactionFee(10500, 10500, 10500);
        resolve(networkFee);
      }
    });
  }
}
