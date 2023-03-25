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

import { ContractApi, Key } from '@zkfs/contract-api';
import { BalanceInfo, PosiContract } from './PosiContract';
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
  Bool,
} from 'snarkyjs';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('Posi', () => {
  let adminAccount: PublicKey,
    adminKey: PrivateKey,
    makerAccount: PublicKey,
    makerKey: PrivateKey,
    posiContractAddress: PublicKey,
    posiContractPrivateKey: PrivateKey,
    posiContract: PosiContract,
    posiUrl: CircuitString,
    posiCid: Field,
    posiCidDepositKey: Key<Field>,
    node: ContractApi;

  beforeAll(async () => {
    await isReady;
    if (proofsEnabled) PosiContract.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({
      proofsEnabled,
      enforceTransactionLimits: false,
    });
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
    posiCidDepositKey = Key.fromType<Field>(Field, posiCid);

    node = new ContractApi();
  });

  afterAll(() => {
    // `shutdown()` internally calls `process.exit()` which will exit the running Jest process early.
    // Specifying a timeout of 0 is a workaround to defer `shutdown()` until Jest is done running all tests.
    // This should be fixed with https://github.com/MinaProtocol/mina/issues/10943
    setTimeout(shutdown, 0);
  });

  async function localDeploy() {
    const txn = await node.transaction(posiContract, adminAccount, () => {
      AccountUpdate.fundNewAccount(adminAccount);
      posiContract.deploy({ zkappKey: posiContractPrivateKey });
      posiContract.initState(adminAccount);
    });
    await txn.prove();
    await txn.sign([adminKey, posiContractPrivateKey]).send();
  }

  async function mintToMaker() {
    const txn = await node.transaction(posiContract, adminAccount, () => {
      posiContract.mint(
        makerAccount,
        posiUrl,
        posiCid,
        Signature.create(adminKey, [
          ...makerAccount.toFields(),
          ...posiUrl.toFields(),
          posiCid,
        ])
      );
    });
    await txn.prove();
    await txn.sign([adminKey]).send();
  }

  it('generates and deploys the Posi smart contract with deployer as owner', async () => {
    await localDeploy();
    const owner = posiContract.owner.get();

    expect(owner).toEqual(adminAccount);
  });

  it('allows admin to mint to another account fixed', async () => {
    await localDeploy();

    expect(
      posiContract.deposits.notExists<Field>(posiCidDepositKey)
    ).toBeTruthy();

    await mintToMaker(); // Under test

    const [value, _] = posiContract.deposits.get(
      BalanceInfo,
      posiCidDepositKey
    );
    const expectedVal: BalanceInfo = {
      url: posiUrl,
      owner: makerAccount,
      spend: [makerAccount, makerAccount, makerAccount],
    };
    expect(value).toStrictEqual(expectedVal);
  });

  it('maker can admin as spender', async () => {
    await localDeploy();
    await mintToMaker();
    const grant = new Bool(true);

    const txn = await node.transaction(posiContract, makerAccount, () => {
      posiContract.allow(
        adminAccount,
        posiCid,
        grant,
        Signature.create(adminKey, [
          ...adminAccount.toFields(),
          posiCid,
          grant.toField(),
        ])
      );
    });
    await txn.prove();
    await txn.sign([makerKey]).send();

    const [value, _] = posiContract.deposits.get(
      BalanceInfo,
      posiCidDepositKey
    );
    const expectedVal = new BalanceInfo({
      url: posiUrl,
      owner: makerAccount,
      spend: [adminAccount, makerAccount, makerAccount],
    });

    expect(value).toStrictEqual(expectedVal);
  });
});
