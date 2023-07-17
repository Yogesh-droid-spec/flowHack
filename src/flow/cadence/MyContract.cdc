// import FlowToken from 0xTOKENADDRESS

// pub contract MyContract {
    
//     pub fun sendTokens(
//         recipient: Address,
//         amount: UFix64
//     ) {
//         // Get the reference to the Flow token resource
//         let token <- FlowToken.main().getCapability<&FlowToken.Vault{FlowToken.Balance}>(/public/flowToken).borrow()!
//         // My Account address
//         let sender: PublicAccount = getAccount(0xd64cbb21bf1c30ee)
//         // Get the recipient's account reference
//         let recipientRef: PublicAccount = getAccount(recipient)

//         // Transfer Flow tokens from sender to recipient
//         token.transfer(from: <-sender, to: <-recipientRef, amount: amount)
//     }

// }
