import { keccak256 } from "ethereumjs-util";
import secp256k1 from "secp256k1";
import * as keccak from "keccak";

const guardians = [
  "0x58CC3AE5C097b213cE3c81979e1B9f9570746AA5",
  "0xfF6CB952589BDE862c25Ef4392132fb9D4A42157",
  "0x114De8460193bdf3A2fCf81f86a09765F4762fD1",
  "0x107A0086b32d7A0977926A205131d8731D39cbEB",
  "0x8C82B2fd82FaeD2711d59AF0F2499D16e726f6b2",
  "0x11b39756C042441BE6D8650b69b54EbE715E2343",
  "0x54Ce5B4D348fb74B958e8966e2ec3dBd4958a7cd",
  "0x15e7cAF07C4e3DC8e7C469f92C8Cd88FB8005a20",
  "0x74a3bf913953D695260D88BC1aA25A4eeE363ef0",
  "0x000aC0076727b35FBea2dAc28fEE5cCB0fEA768e",
  "0xAF45Ced136b9D9e24903464AE889F5C8a723FC14",
  "0xf93124b7c738843CBB89E864c862c38cddCccF95",
  "0xD2CC37A4dc036a8D232b48f62cDD4731412f4890",
  "0xDA798F6896A3331F64b48c12D1D57Fd9cbe70811",
  "0x71AA1BE1D36CaFE3867910F99C09e347899C19C3",
  "0x8192b6E7387CCd768277c17DAb1b7a5027c0b3Cf",
  "0x178e21ad2E77AE06711549CFBB1f9c7a9d8096e8",
  "0x5E1487F35515d02A92753504a8D75471b9f49EdB",
  "0x6FbEBc898F403E4773E95feB15E80C9A99c8348d",
]

const bufferToBigInt = (buf: Buffer) => {
  return BigInt(`0x${buf.toString("hex")}`);
}

function extractPriceInfoFromAccumulatorUpdate(
  updateData: Buffer
) {
  try {
    let offset = 0;
    offset += 4; // magic
    offset += 1; // major version
    offset += 1; // minor version

    const trailingHeaderSize = updateData.readUint8(offset);
    offset += 1 + trailingHeaderSize;

    const updateType = updateData.readUint8(offset);
    offset += 1;

    if (updateType !== 0) {
      console.error(`Invalid accumulator update type: ${updateType}`);
      return undefined;
    }

    const vaaLength = updateData.readUint16BE(offset);
    offset += 2;

    const vaaBuffer = updateData.slice(offset, offset + vaaLength);

    //vaa parse 
    const sigStart = 6;
    const numSigners = vaaBuffer[5];
    const sigLength = 66;
    const guardianSignatures = [];
    for (let i = 0; i < numSigners; ++i) {
      const start = sigStart + i * sigLength;
      guardianSignatures.push({
        index: vaaBuffer[start],
        signature: Buffer.from(vaaBuffer.subarray(start + 1, start + 66)).toString("hex"),
      });
    }
    const body = vaaBuffer.subarray(sigStart + sigLength * numSigners);
    //vaa parse 
    const vaaAssertationTime = body.readUint32BE()
    const digest = body.slice(-20);

    offset += vaaLength;

    const numUpdates = updateData.readUint8(offset);
    offset += 1;

    const dataParsed = []
    for (let i = 0; i < numUpdates; i++) {
      const messageLength = updateData.readUint16BE(offset);
      offset += 2;
      const message = updateData.slice(offset, offset + messageLength);
      offset += messageLength;
      const proofLength = updateData.readUint8(offset);
      offset += 1;

      let proofs = [];
      let currentDigest = keccak256(Buffer.concat([Buffer.from([0]), message])).slice(0, 20); // take 20bytes from keccak hash from message 
      for (let i = 0; i < proofLength; i++) {
        let sibling = updateData.slice(offset, offset + 20);
        proofs.push(sibling.toString("hex"));
        let a = currentDigest
        let b = sibling
        if (bufferToBigInt(a) > bufferToBigInt(b)) {
          a = sibling
          b = currentDigest
        }
        currentDigest = keccak256(Buffer.concat([Buffer.from([1]), a, b])).slice(0, 20);
        offset += 20;
      }

      const isMerkleProofValid = digest.toString("hex") == currentDigest.toString("hex");

      let messageOffset = 0;
      const messageType = message.readUint8(messageOffset);
      messageOffset += 1;

      if (messageType !== 0) {
        continue;
      }

      const priceId = message
        .slice(messageOffset, messageOffset + 32)
        .toString("hex");
      messageOffset += 32;
      const price = message.readBigInt64BE(messageOffset);
      messageOffset += 8;
      messageOffset += 8;
      const expo = message.readInt32BE(messageOffset);
      messageOffset += 4;
      const publishTime = message.readBigInt64BE(messageOffset);
      messageOffset += 8;
      messageOffset += 8;
      const emaPrice = message.readBigInt64BE(messageOffset);
      messageOffset += 8;
      dataParsed.push({
        priceId,
        isMerkleProofValid,
        emaPrice: emaPrice.toString(),
        attestationTime: Number(publishTime), //TODO USE VAAASSERTATIONTIME!!!
        publishTime,
        price: price.toString(),
        expo,
        proofs,
        message: message.toString("hex"),
      })
    }
    return { vaaProof: { guardianSignatures, body: body.toString('hex') }, dataParsed };
  } catch (e) {
    console.log(e)
    return undefined
  }
}

function checksumAddress(address: string) {
  address = address.toLowerCase().replace("0x", "");
  const hash = keccak.default("keccak256").update(address).digest("hex");
  let ret = "0x";
  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }
  return ret;
}

export const loadWormholeData = async () => {
  const btcId = "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
  const ethId = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
  const amznId = "0xb5d0e0fa58a1f8b81498ae670ce93c872d14434b72c364885d4fa1b257cbb07a";
  const goldId = "0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2";
  const tonId = "0x8963217838ab4cf5cadc172203c1f0b763fbaa45f346d8ee50ba994bbcac3026";
  const usdtId = "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b";
  const appleId = "0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688";
  const eurId = "0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b";
  const solId = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
  let res = {} as any

  while (true) {
    try {
      res = await fetch(`https://hermes.pyth.network/api/latest_vaas?ids[]=${btcId}&ids[]=${ethId}&ids[]=${amznId}&ids[]=${goldId}&ids[]=${tonId}&ids[]=${usdtId}&ids[]=${appleId}&ids[]=${eurId}&ids[]=${solId}`);
      if (res.status == 200) {
        break
      }
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  const json = await res.json();
  const vaa = Buffer.from(json[0], 'base64');
  const parsedResult = extractPriceInfoFromAccumulatorUpdate(vaa)

  if (!(parsedResult && parsedResult.dataParsed[0])) {
    console.log('no data')
    return undefined
  }
  if (parsedResult.vaaProof.guardianSignatures.length < guardians.length * 2 / 3) {
    console.log("not enough signatures")
    return undefined
  } else {
    const body_hash = keccak256(Buffer.from(parsedResult.vaaProof.body, "hex"))
    const messageHash = keccak.default("keccak256").update(body_hash).digest();
    let i = 0;
    let valid = 0;
    while (i < parsedResult.vaaProof.guardianSignatures.length) {
      const recoveryID = Buffer.from(parsedResult.vaaProof.guardianSignatures[i].signature, 'hex')[64] % 2;
      const signature = Buffer.from(parsedResult.vaaProof.guardianSignatures[i].signature, 'hex').slice(0, 64);
      const publicKey = Buffer.from(secp256k1.ecdsaRecover(signature, recoveryID, messageHash, false));
      const publicKeyHash = keccak256(publicKey.slice(1))
      const address = Buffer.from(publicKeyHash).slice(-20).toString("hex");
      if (checksumAddress(address) === guardians[parsedResult.vaaProof.guardianSignatures[i].index]) {
        valid++
      }
      i++;
    }
    if (valid < parsedResult.vaaProof.guardianSignatures.length * 2 / 3) {
      console.log("invalid signatures")
      return undefined
    } else {
      return parsedResult
    }
  }
}
