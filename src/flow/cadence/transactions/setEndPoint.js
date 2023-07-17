export const clientsetEndPoint = `
import User from 0xd64cbb21bf1c30ee

transaction(endPoint: String) {
    let address: Address
    prepare(currentUser: AuthAccount) {
        self.address = currentUser.address
        currentUser
            .borrow<&{User.Owner}>(from: User.privatePath)!
            .setEndPoint(endPoint)
    }
    post {
        User.check(self.address): "Account was not initialized"
    }
}
`