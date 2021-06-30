import { URDecoder } from '@ngraveio/bc-ur';
import b58 from 'bs58check';
import {
  CryptoHDKey,
  CryptoKeypath,
  CryptoOutput,
  PathComponent,
  ScriptExpressions,
  CryptoPSBT,
  CryptoAccount,
  Bytes,
} from '@keystonehq/bc-ur-registry';
import { decodeUR as origDecodeUr, encodeUR as origEncodeUR, extractSingleWorkload as origExtractSingleWorkload } from '../bc-ur/dist';
import { MultisigCosigner, MultisigHDWallet } from '../../class';
import { Psbt } from 'bitcoinjs-lib';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USE_UR_V1 = 'USE_UR_V1';

let useURv1 = false;

(async () => {
  try {
    useURv1 = !!(await AsyncStorage.getItem(USE_UR_V1));
  } catch (_) {}
})();

async function isURv1Enabled() {
  try {
    return !!(await AsyncStorage.getItem(USE_UR_V1));
  } catch (_) {}

  return false;
}

async function setUseURv1() {
  await new Promise(resolve => setTimeout(resolve, 1000)); // sleep
  // sleep is needed for test envirnment mostly, for a case when setUseURv1() and init function have a race condition
  useURv1 = true;
  return AsyncStorage.setItem(USE_UR_V1, '1');
}

async function clearUseURv1() {
  useURv1 = false;
  return AsyncStorage.removeItem(USE_UR_V1);
}

function encodeUR(arg1, arg2) {
  return useURv1 ? encodeURv1(arg1, arg2) : encodeURv2(arg1, arg2);
}

function encodeURv1(arg1, arg2) {
  // first, lets check that its not a cosigner's json, which we do NOT encode at all:
  try {
    const json = JSON.parse(arg1);
    if (json && json.xpub && json.path && json.xfp) return [arg1];
  } catch (_) {}

  return origEncodeUR(arg1, arg2);
}

/**
 *
 * @param str {string} For PSBT, or coordination setup (translates to `bytes`) it expects hex string. For ms cosigner it expects plain json string
 * @param len {number} lenght of each fragment
 * @return {string[]} txt fragments ready to be displayed in dynamic QR
 */
function encodeURv2(str, len) {
  // now, lets do some intelligent guessing what we've got here, psbt hex, or json with a multisig cosigner..?

  try {
    const cosigner = new MultisigCosigner(str);

    if (cosigner.isValid()) {
      let scriptExpressions = false;

      if (cosigner.isNativeSegwit()) {
        scriptExpressions = [ScriptExpressions.WITNESS_SCRIPT_HASH];
      } else if (cosigner.isWrappedSegwit()) {
        scriptExpressions = [ScriptExpressions.SCRIPT_HASH, ScriptExpressions.WITNESS_SCRIPT_HASH];
      } else if (cosigner.isLegacy()) {
        scriptExpressions = [ScriptExpressions.SCRIPT_HASH];
      } else {
        return ['unsupported multisig type'];
      }

      const cryptoKeyPathComponents = [];
      for (const component of cosigner.getPath().split('/')) {
        if (component === 'm') continue;
        const index = parseInt(component);
        const hardened = component.endsWith('h') || component.endsWith("'");
        cryptoKeyPathComponents.push(new PathComponent({ index, hardened }));
      }

      const cryptoAccount = new CryptoAccount(Buffer.from(cosigner.getFp(), 'hex') /* masterFingerprint */, [
        new CryptoOutput(
          scriptExpressions,
          new CryptoHDKey({
            isMaster: false,
            key: Buffer.from(cosigner.getKeyHex(), 'hex'), // p2wshKey.publicKey
            chainCode: Buffer.from(cosigner.getChainCodeHex(), 'hex'), // p2wshKey.chainCode,
            origin: new CryptoKeypath(
              cryptoKeyPathComponents,
              Buffer.from(cosigner.getFp(), 'hex'), // masterFingerprint,
              cosigner.getDepthNumber(), // p2wshKey.depth,
            ),
            parentFingerprint: Buffer.from(cosigner.getParentFingerprintHex(), 'hex'), // parentFingerprint,
          }),
        ),
      ]);
      const ur = cryptoAccount.toUREncoder(2000).nextPart();
      return [ur];
    }
  } catch (_) {}

  // not account. lets try psbt

  try {
    Psbt.fromHex(str); // will throw if not PSBT hex
    const data = Buffer.from(str, 'hex');
    const cryptoPSBT = new CryptoPSBT(data);
    const encoder = cryptoPSBT.toUREncoder(len);

    const ret = [];
    for (let c = 1; c <= encoder.fragmentsLength; c++) {
      const ur = encoder.nextPart();
      ret.push(ur);
    }

    return ret;
  } catch (_) {}

  // fail. fallback to bytes

  const bytes = new Bytes(Buffer.from(str, 'hex'));
  const encoder = bytes.toUREncoder(len);

  const ret = [];
  for (let c = 1; c <= encoder.fragmentsLength; c++) {
    const ur = encoder.nextPart();
    ret.push(ur);
  }

  return ret;
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

  if (decoded.type === 'crypto-psbt') {
    const cryptoPsbt = CryptoPSBT.fromCBOR(decoded.cbor);
    return cryptoPsbt.getPSBT().toString('hex');
  }

  if (decoded.type === 'bytes') {
    const b = Bytes.fromCBOR(decoded.cbor);
    return b.getData();
  }

  const cryptoAccount = CryptoAccount.fromCBOR(decoded.cbor);
  // console.log(cryptoAccount.outputDescriptors[0]);

  // now, crafting zpub out of data we have
  const hdKey = cryptoAccount.outputDescriptors[0].getCryptoKey();
  const derivationPath = 'm/' + hdKey.getOrigin().getPath();
  const script = cryptoAccount.outputDescriptors[0].getScriptExpressions()[0].getExpression();
  const isMultisig =
    script === ScriptExpressions.WITNESS_SCRIPT_HASH.getExpression() ||
    // fallback to paths (unreliable).
    // dont know how to add ms p2sh (legacy) or p2sh-p2wsh (wrapped segwit) atm
    derivationPath === MultisigHDWallet.PATH_LEGACY ||
    derivationPath === MultisigHDWallet.PATH_WRAPPED_SEGWIT ||
    derivationPath === MultisigHDWallet.PATH_NATIVE_SEGWIT;
  const version = Buffer.from(isMultisig ? '02aa7ed3' : '04b24746', 'hex');
  const parentFingerprint = hdKey.getParentFingerprint();
  const depth = hdKey.getOrigin().getDepth();
  const depthBuf = Buffer.alloc(1);
  depthBuf.writeUInt8(depth);
  const components = hdKey.getOrigin().getComponents();
  const lastComponents = components[components.length - 1];
  const index = lastComponents.isHardened() ? lastComponents.getIndex() + 0x80000000 : lastComponents.getIndex();
  const indexBuf = Buffer.alloc(4);
  indexBuf.writeUInt32BE(index);
  const chainCode = hdKey.getChainCode();
  const key = hdKey.getKey();
  const data = Buffer.concat([version, depthBuf, parentFingerprint, indexBuf, chainCode, key]);

  const zpub = b58.encode(data);

  const result = {};
  result.ExtPubKey = zpub;
  result.MasterFingerprint = cryptoAccount.getMasterFingerprint().toString('hex').toUpperCase();
  result.AccountKeyPath = derivationPath;

  const str = JSON.stringify(result);
  return Buffer.from(str, 'ascii').toString('hex'); // we are expected to return hex-encoded string
}

class BlueURDecoder extends URDecoder {
  toString() {
    const decoded = this.resultUR();

    if (decoded.type === 'crypto-psbt') {
      const cryptoPsbt = CryptoPSBT.fromCBOR(decoded.cbor);
      return cryptoPsbt.getPSBT().toString('base64');
    }
  }
}

export { decodeUR, encodeUR, extractSingleWorkload, BlueURDecoder, encodeURv1, encodeURv2, isURv1Enabled, setUseURv1, clearUseURv1 };
