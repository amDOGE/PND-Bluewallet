import Frisbee from 'frisbee';

export default class Azteco {
  /**
   * Redeems an Azteco bitcoin voucher.
   *
   * @param {string[]} voucher - 16-digit voucher code in groups of 4.
   * @param {string} address - Bitcoin address to send the redeemed bitcoin to.
   *
   * @returns {Promise<boolean>}
   */
  async redeem(voucher, address) {
    const api = new Frisbee({
      baseURI: 'https://azte.co/',
    });
    const url = `/blue_despatch.php?CODE_1=${voucher[0]}&CODE_2=${voucher[1]}&CODE_3=${voucher[2]}&CODE_4=${voucher[3]}&ADDRESS=${address}`;

    try {
      let response = await api.get(url);
      return response && response.originalResponse && +response.originalResponse.status === 200;
    } catch (_) {
      return false;
    }
  }
}
