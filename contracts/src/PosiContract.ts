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
 * It takes a public key and returns a key that can be used
 * to retrieve the deposit of the public key
 *
 * @param {PublicKey} address - PublicKey
 * The public key of the account that you want to get the deposit key for.
 *
 * @returns A Key<PublicKey>
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

    const depositIdx = getDepositIdx(cid);
    this.deposits.assertNotExists(depositIdx);

    signature
      .verify(owner, [...to.toFields(), ...url.toFields(), cid])
      .assertTrue();

    this.deposits.set<Field, BalanceInfo>(BalanceInfo, depositIdx, {
      url: url,
      owner: to,
      spend: [to, to, to],
    });
  }

  @method allow(
    spender: PublicKey,
    cid: Field,
    grant: Bool, // As opposed to revoke.
    signature: Signature
  ) {
    const [balanceInfo, status] = this.deposits.get<Field, BalanceInfo>(
      BalanceInfo,
      getDepositIdx(cid)
    );
    const owner = balanceInfo.owner;
    let spend = balanceInfo.spend;

    signature.verify(owner, [...spender.toFields(), cid, grant.toField()]);

    spender.equals(owner).assertFalse();

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

    this.deposits.set<Field, BalanceInfo>(BalanceInfo, getDepositIdx(cid), {
      ...balanceInfo,
      spend: newSpend,
    });
  }
}
