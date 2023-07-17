export const getUserInfo = `
import User from 0xd64cbb21bf1c30ee
pub fun main(address: Address): User.ReadOnly? {
    return User.read(address)
}
`