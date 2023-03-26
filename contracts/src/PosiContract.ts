import {
  Field,
  state,
  State,
  method,
  PublicKey,
  Signature,
  CircuitString,
  Struct,
  Bool,
  Circuit,
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

/**
 * It takes a content id, 'cid', and returns an that can be used
 * to retrieve the data deposited at that index.
 *
 * @param {Field} cid - Field
 * The index of the data with that cid.
 *
 * @returns A Key<Field>
 */
const getDepositIdx: (cid: Field) => Key<Field> = (cid) => {
  return Key.fromType<Field>(Field, cid);
};

export class PosiContract extends OffchainStateContract {
  // until snarkyjs fixes bug with state indexes in extended classes
  @state(Field) public placeholder = State<Field>();

  @state(PublicKey) owner = State<PublicKey>();
  @offchainState() public deposits = OffchainState.fromMap();

  public init() {
    super.init();
    this.deposits.setRootHash(OffchainStateMap.initialRootHash());
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
    const owner = this.owner.get();
    this.owner.assertEquals(owner);

    this.deposits.assertNotExists(getDepositIdx(cid));

    signature
      .verify(owner, [...to.toFields(), ...url.toFields(), cid])
      .assertTrue();

    this.deposits.set<Field, BalanceInfo>(
      BalanceInfo,
      getDepositIdx(cid),
      new BalanceInfo({
        url: url,
        owner: to,
        spend: [to, to, to],
      })
    );
  }

  @method allow(
    spender: PublicKey,
    cid: Field,
    grant: Bool, // As opposed to revoke.
    signature: Signature
  ) {
    Circuit.log('1');
    const [balanceInfo, status] = this.deposits.get<Field, BalanceInfo>(
      BalanceInfo,
      getDepositIdx(cid)
    );
    Circuit.log(balanceInfo);
    const owner = balanceInfo.owner;
    const spend = balanceInfo.spend;

    Circuit.log('2');
    signature
      .verify(owner, [...spender.toFields(), cid, grant.toField()])
      .assertTrue();

    Circuit.log('3');
    spender.equals(owner).assertFalse();

    Circuit.log('4');
    Circuit.if(
      grant,
      spend[0]
        .equals(owner)
        .or(spend[1].equals(owner).or(spend[2].equals(owner))),
      spend[0]
        .equals(spender)
        .or(spend[1].equals(spender))
        .or(spend[2].equals(spender))
    ).assertTrue();

    Circuit.log('5');
    const newSpend = Circuit.if(
      grant,
      [
        Circuit.if(spend[0].equals(owner), spender, spend[0]),
        Circuit.if(
          spend[0].equals(owner).not().and(spend[1].equals(owner)),
          spender,
          spend[1]
        ),
        Circuit.if(
          spend[0].equals(owner).not().and(spend[1].equals(owner).not()),
          spender,
          spend[2]
        ),
      ],
      [
        Circuit.if(spend[0].equals(spender), owner, spend[0]),
        Circuit.if(
          spend[0].equals(spender).not().and(spend[1].equals(spender)),
          owner,
          spend[1]
        ),
        Circuit.if(
          spend[0].equals(spender).not().and(spend[1].equals(spender).not()),
          owner,
          spend[2]
        ),
      ]
    );
    Circuit.log(newSpend);
    Circuit.log('6');

    this.deposits.set<Field, BalanceInfo>(
      BalanceInfo,
      getDepositIdx(cid),
      new BalanceInfo({
        ...balanceInfo,
        spend: newSpend,
      })
    );
    Circuit.log('7');
  }

  @method claim(cid: Field, claimant: PublicKey, signature: Signature) {
    const [balanceInfo, status] = this.deposits.get<Field, BalanceInfo>(
      BalanceInfo,
      getDepositIdx(cid)
    );
    const owner = balanceInfo.owner;
    const spend = balanceInfo.spend;
    owner.equals(claimant).assertFalse();

    signature.verify(claimant, [cid, ...claimant.toFields()]).assertTrue();

    claimant
      .equals(spend[0])
      .or(claimant.equals(spend[1]).or(claimant.equals(spend[2])))
      .assertTrue();

    this.deposits.set<Field, BalanceInfo>(
      BalanceInfo,
      getDepositIdx(cid),
      new BalanceInfo({
        ...balanceInfo,
        owner: claimant,
        spend: [claimant, claimant, claimant],
      })
    );
  }
}
