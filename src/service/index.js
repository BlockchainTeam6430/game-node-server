
class Service {

    constructor() {
        this.web3 = null;
        this.account = null;
        this.gameContract = null;
    }

    async currentRoom() {
        try {
            const roomAddr = await this.gameContract.methods.playingRoom().call();
            console.log(roomAddr)
            return await this.gameContract.methods.gameLists(roomAddr).call();
        }catch (error) {
            console.log(error);
            return null;
        }
    }

    async gameOver(room, winner) {

        let tx = this.gameContract.methods.gameOver(room, winner);

        try {
            await this.sendTransaction(tx, this.gameContract.options.address);
            console.log("new nft is minted");
            return true;
        }catch (e) {
            console.log(e);
            return false;
        }
    }

    async checkUser(account, key) {
        try {
            return await this.gameContract.methods.checkUser(account, key).call();
        }catch (error) {
            console.log(error);
            return false;
        }
    }

    async sendTransaction(tx, contractAddress) {
        this.web3.eth.accounts.wallet.add(process.env.PRIVATE_KEYS);
        const gas = await tx.estimateGas({from: this.account.address});
        const gasPrice = await this.web3.eth.getGasPrice();
        const data = tx.encodeABI();
        const nonce = await this.web3.eth.getTransactionCount(this.account.address);

        const txData = {
            from: this.account.address,
            to: contractAddress,
            data: data,
            gas,
            gasPrice,
            nonce, 
        };
        return await this.web3.eth.sendTransaction(txData);
    }
}

module.exports = new Service();
