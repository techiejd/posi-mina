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
} from 'snarkyjs';

type Balance = {
  cid: Field;
  url: CircuitString;
  owner: PublicKey;
  spend: PublicKey[];
};
// My totally safe OneWe storage service that totally authenticates every user.
// In this js example not so bad because exported vars are read only.
export const balances: { [ledger: number]: Balance[] } = {};

const flattenedBalances = (balances: Balance[]) => {
  return balances.flatMap((balance) => {
    return [
      balance.cid,
      ...balance.url.toFields(),
      ...balance.owner.toFields(),
      ...balance.spend.flatMap((pk) => pk.toFields()),
    ];
  });
};

export class PosiContract extends SmartContract {
  @state(PublicKey) owner = State<PublicKey>();
  @state(Field) balancesHash = State<Field>();
  @state(UInt32) testCase = State<UInt32>();

  @method initState(owner: PublicKey, testCase: UInt32) {
    Circuit.log('ayo1: ', testCase);
    console.log('ayo2: ', testCase);
    this.owner.set(owner);
    this.testCase.set(testCase);
    // TODO(techiejd): check that the test case is not already in balances.
    const idx = Number(testCase.toString());
    Circuit.log('ayo2.1', idx);
    console.log('ayo2.1', idx);
    Field(Object.keys(balances).indexOf(String(idx))).assertEquals(-1);
    balances[idx] = [];
    Circuit.log('ayo3: ', balances[idx]);
    console.log('ayo4: ', balances[idx]);
    Circuit.log('ayo5: ', Poseidon.hash(flattenedBalances(balances[idx])));
    console.log('ayo6: ', Poseidon.hash(flattenedBalances(balances[idx])));
    this.balancesHash.set(Poseidon.hash(flattenedBalances(balances[idx])));
  }

  @method mint(
    to: PublicKey,
    url: CircuitString,
    cid: Field,
    signature: Signature,
    testCase: UInt32
  ) {
    console.log(testCase);
    Circuit.log(testCase);
    Circuit.log('Here');
    const owner = this.owner.get();
    this.owner.assertEquals(owner);

    Circuit.log('1');

    const idx = Number(testCase.toString());
    this.testCase.assertEquals(testCase);

    Circuit.log('1.5');

    Field(
      balances[idx].findIndex(
        (balance) => balance.cid.equals(cid) || balance.url.equals(url)
      )
    ).assertEquals(-1);

    Circuit.log('2');

    const balancesHash = this.balancesHash.get();
    Circuit.log('2.1');
    this.balancesHash.assertEquals(balancesHash);
    Circuit.log('2.2');
    console.log(balances[idx]);
    Circuit.log(Poseidon.hash(flattenedBalances(balances[idx])));
    balancesHash.assertEquals(Poseidon.hash(flattenedBalances(balances[idx])));

    Circuit.log('3');

    signature
      .verify(owner, [
        ...to.toFields(),
        ...url.toFields(),
        cid,
        ...testCase.toFields(),
      ])
      .assertTrue();

    Circuit.log('4');

    balances[idx].push({ cid: cid, url: url, owner: to, spend: [] });

    Circuit.log('5');

    this.balancesHash.set(Poseidon.hash(flattenedBalances(balances[idx])));
  }

  @method allow(
    spender: PublicKey,
    cid: Field,
    signature: Signature,
    testCase: UInt32 = UInt32.from(0)
  ) {
    const idx = Number(testCase.toString());
    this.testCase.assertEquals(testCase);

    this.balancesHash
      .get()
      .assertEquals(Poseidon.hash(flattenedBalances(balances[idx])));

    const balanceIdx = balances[idx].findIndex((balance) =>
      balance.cid.equals(cid)
    );
    balances[idx][balanceIdx] = {
      ...balances[idx][balanceIdx],
      spend: [...balances[idx][balanceIdx].spend, spender],
    };

    this.balancesHash.set(Poseidon.hash(flattenedBalances(balances[idx])));
  }
}
