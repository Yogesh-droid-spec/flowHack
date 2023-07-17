pub contract Profile {
    pub let publicPath: PublicPath
    pub let privatePath: StoragePath

    pub event hostAddressChanged(my_address: Address,target_address:String)

    pub resource interface Public {
        pub fun getCommands(): [String]
        pub fun getFileUrl(): String
        pub fun getHostAddress(): String
        pub fun asReadOnly(): Profile.ReadOnly
    }

    pub resource interface Owner {
        pub fun getCommands(): [String]
        pub fun getFileUrl(): String
        pub fun getHostAddress(): String
        pub fun setCommands(_ commands: [String])
        pub fun setFileUrl(_ fileurl: String)
        pub fun setHostAddress(_ hostAddress: String)
    }
    pub resource Base : Public,Owner {
        access(self) var fileUrl: String
        access(self) var commands: [String]
        access(self) var hostAddress: String
        init(){
            self.fileUrl = ""
            self.commands = []
            self.hostAddress = ""
        }
        pub fun getCommands(): [String] {return self.commands}
        pub fun getFileUrl(): String {return self.fileUrl}
        pub fun getHostAddress(): String {return self.hostAddress}
        pub fun setCommands(_ cmds: [String]) {self.commands = cmds}
        pub fun setFileUrl(_ fU: String){self.fileUrl = fU}
        pub fun setHostAddress(_ hA: String) {
          self.hostAddress=hA
          //log(self.owner?.address)
          //log(self.owner)
          emit hostAddressChanged(my_address: self.owner?.address!,target_address:hA)
        }
        pub fun asReadOnly(): Profile.ReadOnly {
          return Profile.ReadOnly(
            address: self.owner?.address,
            fileUrl: self.getFileUrl(),
            commands: self.getCommands(),
            hostAddress: self.getHostAddress()
          )
        }
    }
    pub struct ReadOnly {
      pub let address: Address?
      pub let fileUrl: String
      pub let commands: [String]
      pub let hostAddress: String
      
      init(address: Address?, fileUrl:String, commands:[String], hostAddress:String) {
        self.address = address
        self.fileUrl = fileUrl
        self.commands = commands
        self.hostAddress = hostAddress
      }
    }
    pub fun new(): @Profile.Base {
        return <- create Base()
    }
    pub fun check(_ address: Address): Bool {
        //log(address)
        return getAccount(address)
        .getCapability<&{Profile.Public}>(Profile.publicPath)
        .check()
    }
    pub fun fetch(_ address: Address): &{Profile.Public} {
        return getAccount(address)
        .getCapability<&{Profile.Public}>(Profile.publicPath)
        .borrow()!
    }
    pub fun read(_ address: Address): Profile.ReadOnly? {
      if let profile = getAccount(address).getCapability<&{Profile.Public}>(Profile.publicPath).borrow() {
        return profile.asReadOnly()
      } else {
        return nil
      }
    }
    init() {
        self.publicPath = /public/profile
        self.privatePath = /storage/profile
        
        self.account.save(<- self.new(), to: self.privatePath)
        self.account.link<&Base{Public}>(self.publicPath, target: self.privatePath)
        
        //self.account
        //.borrow<&Base{Owner}>(from: self.privatePath)!
        //.setHostAddress("temp")
    }
}