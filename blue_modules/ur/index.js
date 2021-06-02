import { URDecoder } from '@apocentre/bc-ur';
// import b58 from 'bs58check';
import { CryptoOutput } from '@keystonehq/bc-ur-registry';
import { decodeUR as origDecodeUr, encodeUR as origEncodeUR, extractSingleWorkload as origExtractSingleWorkload } from '../bc-ur/dist';
// const HDNode = require('bip32');

function encodeUR(arg1, arg2) {
  return origEncodeUR(arg1, arg2);
}

function extractSingleWorkload(arg) {
  return origExtractSingleWorkload(arg);
}

function decodeUR(arg) {
  try {
    return origDecodeUr(arg);
  } catch (_) {}

  const decoder = new URDecoder();

  for (const part of arg) {
    decoder.receivePart(part);
  }

  if (!decoder.isSuccess()) {
    throw new Error(decoder.resultError());
  }

  const decoded = decoder.resultUR();
  const cryptoOutput = CryptoOutput.fromCBOR(decoded.cbor);

  /*const child = HDNode.fromPublicKey(cryptoOutput.getHDKey().getKey(), cryptoOutput.getHDKey().getChainCode());
  const xpub = child.toBase58();
  let data = b58.decode(xpub);
  data = data.slice(4);
  data = Buffer.concat([Buffer.from('04b24746', 'hex'), data]);
  const zpub = b58.encode(data);
  console.log(zpub);*/

  const result = {};
  result.ExtPubKey = 'zpub6qT7amLcp2exr4mU4AhXZMjD9CFkopECVhUxc9LHW8pNsJG2B9ogs5sFbGZpxEeT5TBjLmc7EFYgZA9EeWEM1xkJMFLefzZc8eigRFhKB8Q'; // fixme
  result.MasterFingerprint = cryptoOutput.getHDKey().getOrigin().getSourceFingerprint().toString('hex').toUpperCase();
  result.AccountKeyPath = cryptoOutput.getHDKey().getOrigin().getPath();

  return JSON.stringify(result);
}

export { decodeUR, encodeUR, extractSingleWorkload };