export const getHostList = `
import HostContract from 0xd64cbb21bf1c30ee
pub fun main() : [Address] {
    return HostContract.getActiveHostAddresses()
}

`