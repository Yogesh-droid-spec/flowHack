export const hostSite = `
import User from 0xd64cbb21bf1c30ee
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

transaction(fileUrl: String,commands:[String],hostAddress:String,amount: UFix64,hostAddress2:Address) {
    let address : Address
    let sentVault: @FungibleToken.Vault
    prepare(currentUser: AuthAccount) {
        self.address = currentUser.address
        //log(self.address)
        if !User.check(self.address) {
            //log("no account found, creating account")
            currentUser.save(<- User.new(), to: User.privatePath)
            currentUser.link<&User.Base{User.Public}>(User.publicPath, target: User.privatePath)
            //log("account created success")
        }
        //log("second log")
        currentUser
            .borrow<&{User.Owner}>(from: User.privatePath)!
            .setFileUrl(fileUrl)
        currentUser
            .borrow<&{User.Owner}>(from: User.privatePath)!
            .setCommands(commands)
        currentUser
            .borrow<&{User.Owner}>(from: User.privatePath)!
            .setHostAddress(hostAddress)

        // Get a reference to the currentUser's stored vault
        let vaultRef = currentUser.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault!")

        // Withdraw tokens from the currentUser's stored vault
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }
    execute {
        // Get a reference to the recipient's Receiver
        let receiverRef =  getAccount(hostAddress2)
            .getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
			?? panic("Could not borrow receiver reference to the recipient's Vault")

        // Deposit the withdrawn tokens in the recipient's receiver
        receiverRef.deposit(from: <-self.sentVault)
    }
}
`