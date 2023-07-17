export const stopHosting = `
import User from 0xd64cbb21bf1c30ee
transaction() {
    let address:Address
    prepare(currentUser: AuthAccount) {
        self.address = currentUser.address
        currentUser
            .borrow<&{User.Owner}>(from: User.privatePath)!
            .stopHosting()
    }
}
`