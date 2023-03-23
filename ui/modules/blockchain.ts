import { Mina, isReady, PublicKey, fetchAccount } from "snarkyjs";

await isReady;

let Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);

export default Mina;