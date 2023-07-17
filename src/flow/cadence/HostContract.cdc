pub contract HostContract {
    pub var hosts: {Address: Bool}
    init() {
        self.hosts = {}
    }
    
    pub fun main() {}

    pub fun registerAsHost(address: Address) {
        // Check if host address already exists
        if self.hosts[address] != nil {
            // Host already registered
            log("already registered host")
            return
        }
        log("host registered success")
        // Register host with active status set to true (1)
        self.hosts[address] = true
    }

    pub fun changeHostStatus(address: Address, activeStatus: Bool) {
        // Check if host address exists in the dictionary
        if self.hosts[address] != nil {
            // Update the active status of the host
            self.hosts[address] = activeStatus
        }else{
            self.hosts[address] = activeStatus
        }
    }

    pub fun getActiveHostAddresses(): [Address] {
        let temp : [Address] = []
        for key in self.hosts.keys{
          if self.hosts[key]!{
            temp.append(key)
          }
        }
        //let activeHosts: [Address] = self.hosts.keys.
        //return activeHosts
        return temp
    }
}