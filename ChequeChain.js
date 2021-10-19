'use-strict';

//hasing algorithm
const hash = require("hash.js");


class Cheque{
	constructor(chequeNum, amount, payee, recipient, dateTime, type, originBranch, operator){
		this.chequeNum = chequeNum; // cheque nbumber unique for each cheque
		this.amount = amount; //amount on the cheque
		this.payee = payee; //the account number of the cheque holder
		this.recipient = recipient; //the name of the person who withdraws cheque or self or cash
		this.dateTime = dateTime; //date on the cheque
		this.type = type; //its either cash or cross cheque
		this.originBranch = originBranch; //the cheque submitted from which branch
		this.operator = operator; //operator name or id who process this cheque
	}
}


//This is the block which holds the cheques and make a block to be added to the blockchain
class chequeBlock{
	
	constructor(timestamp, cheques, previousHash = ''){
		this.timestamp = timestamp; //timestamp of this block
		this.cheques = cheques; //holds list of cheques added to this block
		this.previousHash = previousHash; //previous blockchain address
		this.hash = this.generateHash(); // hash is used to uniquely identity this block in the blockchain
		this.nonce = 0; // this is used mostly used for PoW system. as in this banking system you can choose not to use it and make a system so that only limited computers can mine the blocks
	}
	
	//this is the function used to generate hash for this block.
	generateHash(){
		return hash.sha256().update(this.previousHash + this.timestamp + JSON.stringify(this.cheques) + this.nonce).digest('hex');
	}
	
	//This is the PoW consensus algorithm for this blockchain which can be changed on the requrements
	mineChequeBlock(difficulty){
		while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
			this.nonce++;
			this.hash = this.generateHash();
		}
	}
}

// this class is used to populate the blockchain adding new block etc...
class chequeBlockchain{
	constructor(){
		this.chequeChain = []; //this holds all the blocks along with cheques. Note that a block can have multiple cheques.
		this.difficulty = 4; // this is used for the consensus algorithm
		this.pendingCheques = []; // this includes all the pending cheques to be added to the new block.
	}
	
	//this function is used to start the blockchain and add the first block in the blockchain along with a test cheque.
	//or you can add a real cheque...
	generateGenesisBlock(){
		var firstCheque = new Cheque('118', 0, 'Mustafizur Rahman', 'Cheque Request', Date.now(), 'cash', 'main branch', 'Sonali Bank');
		this.pendingCheques.push(firstCheque);
		var block = new chequeBlock(Date.now(), this.pendingCheques);
		block.mineChequeBlock(this.difficulty);
		this.chequeChain = [block];
		this.pendingCheques = [];
	}
	
	//get the last block in the blockchain
	getLastBlock(){
		return this.chequeChain[this.chequeChain.length - 1];
	}
	
	//this function mine pending transactions and add the block to blockchain then empty the pending transactions array
	minePendingCheques(){
		var block = new chequeBlock(Date.now(), this.pendingCheques, this.getLastBlock().hash);
		block.mineChequeBlock(this.difficulty);
		
		console.log("block mined successfully...");
		
		this.chequeChain.push(block);
		
		this.pendingCheques = [];
	}
	
	//add cheques to the pending cheques array to be mined.
	addCheques(cheque){
		this.pendingCheques.push(cheque);
	}
	
	// check if the blockchain is valid and not tempered with.
	isValidChain(){
		for (var i=1; i < this.chequeChain.length; i++){
			var currentBlock = this.block[i];
			var previousBlock = this.block[i - 1];
			
			if(currentBlock.hash !== currentBlock.generateHash()){
				return false;
			}
			if(currentBlock.previousHash !== previousBlock.hash){
				return false;
			}
		}
		return true;
	}
	
	//this method get balance of any person of address on the blockchain as the balance is not stored on blockchain its scattered across all network.
	//you can make a database of addresses on the blockchain and update address balance as blockchain synced
	//so you dont have to search all blockchain again and again, which is what most cryptocurrencies do in production.
	getBalanceOfAddress(address){
		var balance = 0;
		for(const block of this.chequeChain){
			for(const cheque of block.cheques){
				if(cheque.payee === address){
					balance -= cheque.amount;
				}
				
				if(cheque.recipient === address){
					balance += cheque.amount;
				}
			}
		}
		return balance;
	}
	
	isChequeValid(cheque){
		for(const block of this.chequeChain){
			for(const bCheque of block.cheques){
				if(bCheque.chequeNum === cheque.chequeNum){
					return false;
				}
			}
		}
		for(const pCheque of this.pendingCheques){
			if(pCheque.chequeNum === cheque.chequeNum){
				return false;
			}
		}
		return true;
	}
}



var chequeCoin = new chequeBlockchain();

chequeCoin.generateGenesisBlock();

console.log("block 1 mining.....");
var chequeToAdd = new Cheque('7861', 80, 'sender', 'reciever', Date.now(), 'cash', 'main branch', 'Sonali Bank');
var chequeToAdd1 = new Cheque('7862', 20, 'sender', 'reciever', Date.now(), 'cash', 'main branch', 'Sonali Bank');
if(chequeCoin.isChequeValid(chequeToAdd)){
	chequeCoin.addCheques(chequeToAdd);
}

if(chequeCoin.isChequeValid(chequeToAdd1)){
	chequeCoin.addCheques(chequeToAdd1);
}
if(chequeCoin.isChequeValid(chequeToAdd1)){
	chequeCoin.addCheques(chequeToAdd1);
}

chequeCoin.minePendingCheques();

console.log("block 2 mining.....");
chequeCoin.addCheques(new Cheque('7863', 50, 'reciever', 'sender', Date.now(), 'cash', 'main branch', 'Sonali Bank'));
chequeCoin.minePendingCheques();


console.log("\n\n");
console.log("reciever balance is "+chequeCoin.getBalanceOfAddress('reciever'));
console.log("sender balance is "+chequeCoin.getBalanceOfAddress('sender'));
console.log("\n\n");
console.log(JSON.stringify(chequeCoin, null, 4));
