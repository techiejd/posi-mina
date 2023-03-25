/**
 * Posi contract should:
 * User uploads data. We certify as PoSI and turn it into an NFT and give it to them.
 * Be called by oneWe to follow this form:
 * - OneWe sets {cid: {url, owner: uid, allowance: [uid]}} in balances in oneWe
 * Be called by oneWe and user to:
 * - Allow to set allowance.
 * Be called by oneWe and user:
 * - Allow to claim
 */

import { PosiContract, balances } from './PosiContract';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  CircuitString,
  Poseidon,
  Signature,
  UInt32,
} from 'snarkyjs';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = true;

describe('Posi', () => {
  let adminAccount: PublicKey,
    adminKey: PrivateKey,
    makerAccount: PublicKey,
    makerKey: PrivateKey,
    posiContractAddress: PublicKey,
    posiContractPrivateKey: PrivateKey,
    posiContract: PosiContract,
    posiUrl: CircuitString,
    posiCid: Field;

  beforeAll(async () => {
    await isReady;
    if (proofsEnabled) PosiContract.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: adminKey, publicKey: adminAccount } = Local.testAccounts[0]);
    ({ privateKey: makerKey, publicKey: makerAccount } = Local.testAccounts[1]);

    posiContractPrivateKey = PrivateKey.random();
    posiContractAddress = posiContractPrivateKey.toPublicKey();
    posiContract = new PosiContract(posiContractAddress);

    posiUrl = CircuitString.fromString('onewe.foundation/posi');
    posiCid = Poseidon.hash(
      CircuitString.fromString('{data: data}').toFields()
    );
  });

  afterAll(() => {
    // `shutdown()` internally calls `process.exit()` which will exit the running Jest process early.
    // Specifying a timeout of 0 is a workaround to defer `shutdown()` until Jest is done running all tests.
    // This should be fixed with https://github.com/MinaProtocol/mina/issues/10943
    setTimeout(shutdown, 0);
  });

  async function localDeploy(testCase: UInt32) {
    console.log('WOrd');
    Mina.transaction(adminAccount, () => {
      AccountUpdate.fundNewAccount(adminAccount);
      posiContract.deploy({ zkappKey: posiContractPrivateKey });
      posiContract.initState(adminAccount, testCase);
    })
      .then((txn) => {
        txn
          .prove()
          .then((proof) => {
            txn.sign([adminKey, posiContractPrivateKey]).send();
          })
          .catch((onrejected) => {
            console.log('reject1');
            console.log(onrejected);
          });
        // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
      })
      .catch((onrejected) => {
        console.log('rejected');
        console.log(onrejected);
      });
  }

  it('generates and deploys the Posi smart contract with deployer as owner', async () => {
    console.log('AYO WTF');
    await localDeploy(UInt32.from(0));
    const owner = posiContract.owner.get();

    console.log('WTF');
    console.log(owner);
    console.log(adminAccount);
    expect(owner).toEqual(adminAccount);
  });

  it('allows owner to mint to another account fixed', async () => {
    const testIdx = UInt32.from(2);
    const ledgerIdx = Number(testIdx.toString());
    await localDeploy(testIdx);

    expect(balances[ledgerIdx].length).toEqual(0);

    console.log('In here yo1');

    const txn = await Mina.transaction(adminAccount, () => {
      posiContract.mint(
        makerAccount,
        posiUrl,
        posiCid,
        Signature.create(adminKey, [
          ...makerAccount.toFields(),
          ...posiUrl.toFields(),
          posiCid,
          ...testIdx.toFields(),
        ]),
        testIdx
      );
    });
    await txn.prove();
    await txn.send();

    console.log('In here yo');
    const firstBalance = balances[ledgerIdx][0];

    expect(balances[ledgerIdx].length).toEqual(1);
    expect(firstBalance).toStrictEqual({
      cid: posiCid,
      url: posiUrl,
      owner: makerAccount,
      spend: [],
    });
  });
});
