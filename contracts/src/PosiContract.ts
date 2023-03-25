import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Poseidon,
  PublicKey,
  Signature,
  CircuitString,
  UInt32,
  Circuit,
  PrivateKey,
  Struct,
} from 'snarkyjs';

import {
  offchainState,
  OffchainStateContract,
  OffchainState,
  OffchainStateMap,
  Key,
} from '@zkfs/contract-api';

export class BalanceInfo extends Struct({
  url: CircuitString,
  owner: PublicKey,
  spend: [PublicKey, PublicKey, PublicKey],
}) {}

export class PosiContract extends OffchainStateContract {
  // until snarkyjs fixes bug with state indexes in extended classes
  @state(Field) public placeholder = State<Field>();

  @state(PublicKey) owner = State<PublicKey>();
  @offchainState() public deposits = OffchainState.fromMap();

  public init() {
    super.init();
    this.deposits.setRootHash(OffchainStateMap.initialRootHash());
  }

  /**
   * It takes a public key and returns a key that can be used
   * to retrieve the deposit of the public key
   *
   * @param {PublicKey} address - PublicKey
   * The public key of the account that you want to get the deposit key for.
   *
   * @returns A Key<PublicKey>
   */
  public getDepositKey(address: PublicKey): Key<PublicKey> {
    return Key.fromType<PublicKey>(PublicKey, address);
  }

  @method initState(owner: PublicKey) {
    this.owner.set(owner);
  }

  @method mint(
    to: PublicKey,
    url: CircuitString,
    cid: Field,
    signature: Signature
  ) {
    Circuit.log('1');
    const owner = this.owner.get();
    Circuit.log('2');
    this.owner.assertEquals(owner);
    Circuit.log('3');

    const depositIdx = Key.fromType<Field>(Field, cid);
    Circuit.log('4');
    this.deposits.assertNotExists(depositIdx);
    Circuit.log('5');

    signature
      .verify(owner, [...to.toFields(), ...url.toFields(), cid])
      .assertTrue();

    Circuit.log('6');

    Circuit.log(url);
    Circuit.log(owner);
    Circuit.log(to);

    const bInfo = new BalanceInfo({
      url: url,
      owner: to,
      spend: [to, to, to],
    });

    Circuit.log(bInfo);
    Circuit.log('bInfo');

    this.deposits.set<Field, BalanceInfo>(PublicKey, depositIdx, bInfo);

    Circuit.log('7');
  }

  /** @method allow(
    spender: PublicKey,
    cid: Field,
    signature: Signature,
    testCase: UInt32 = UInt32.from(0)
  ) {
  } */
}
