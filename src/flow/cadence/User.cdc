pub contract User {
    pub let publicPath: PublicPath
    pub let privatePath: StoragePath

    // triggers when client uploads files and commands
    // host listens to this and fetch site and commands to execute
    pub event hostAddressChanged(my_address: Address,target_address:String,fileUrl:String,commands:[String])
    
    // triggers when site is deployed and endpoint is genrated by host
    // client listens to this and fetch endpoint
    pub event siteHosted(clientAddress:Address,endPoint:String)

    // client triggers this to stop hosting his site
    pub event stopHostProcess(hostAddress:String)

    pub resource interface Public {
        pub fun getCommands(): [String]
        pub fun getFileUrl(): String
        pub fun getHostAddress(): String
        pub fun getEndPoint(): String
        pub fun asReadOnly(): User.ReadOnly
    }

    pub fun endPointGenerated(clientAddress:Address,endPoint:String){
      emit siteHosted(clientAddress:clientAddress,endPoint:endPoint)
    }

    pub resource interface Owner {
        pub fun getCommands(): [String]
        pub fun getFileUrl(): String
        pub fun getHostAddress(): String
        pub fun getEndPoint(): String
        pub fun setCommands(_ commands: [String])
        pub fun setFileUrl(_ fileurl: String)
        pub fun setHostAddress(_ hostAddress: String)
        pub fun setEndPoint(_ endPoint: String)
        pub fun stopHosting()
    }
    pub resource Base : Public,Owner {
        access(self) var fileUrl: String
        access(self) var commands: [String]
        access(self) var hostAddress: String
        access(self) var endPoint: String
        init(){
            self.fileUrl = ""
            self.commands = []
            self.hostAddress = ""
            self.endPoint = ""
        }
        pub fun getCommands(): [String] {return self.commands}
        pub fun getFileUrl(): String {return self.fileUrl}
        pub fun getHostAddress(): String {return self.hostAddress}
        pub fun getEndPoint(): String {return self.endPoint}
        pub fun setCommands(_ cmds: [String]) {self.commands = cmds}
        pub fun setFileUrl(_ fU: String){self.fileUrl = fU}
        pub fun setHostAddress(_ hA: String) {
          self.hostAddress=hA
          //log(self.owner?.address)
          //log(self.owner)
          emit hostAddressChanged(my_address: self.owner?.address!,target_address:hA,fileUrl: self.fileUrl,commands:self.commands)
        }
        pub fun setEndPoint(_ eP: String){
          self.endPoint = eP
        }
        pub fun stopHosting(){
          emit stopHostProcess(hostAddress: self.hostAddress)
          self.endPoint = ""
          self.commands=[]
          self.fileUrl=""
          self.hostAddress = ""
        }
        pub fun asReadOnly(): User.ReadOnly {
          return User.ReadOnly(
            address: self.owner?.address,
            fileUrl: self.getFileUrl(),
            commands: self.getCommands(),
            hostAddress: self.getHostAddress(),
            endPoint: self.getEndPoint()
          )
        }
    }
    pub struct ReadOnly {
      pub let address: Address?
      pub let fileUrl: String
      pub let commands: [String]
      pub let hostAddress: String
      pub let endPoint: String
      init(address: Address?, fileUrl:String, commands:[String], hostAddress:String, endPoint:String) {
        self.address = address
        self.fileUrl = fileUrl
        self.commands = commands
        self.hostAddress = hostAddress
        self.endPoint = endPoint
      }
    }
    pub fun new(): @User.Base {
        return <- create Base()
    }
    pub fun check(_ address: Address): Bool {
        //log(address)
        return getAccount(address)
        .getCapability<&{User.Public}>(User.publicPath)
        .check()
    }
    pub fun fetch(_ address: Address): &{User.Public} {
        return getAccount(address)
        .getCapability<&{User.Public}>(User.publicPath)
        .borrow()!
    }
    pub fun read(_ address: Address): User.ReadOnly? {
      if let profile = getAccount(address).getCapability<&{User.Public}>(User.publicPath).borrow() {
        return profile.asReadOnly()
      } else {
        return nil
      }
    }
    init() {
        self.publicPath = /public/user
        self.privatePath = /storage/user
        
        self.account.save(<- self.new(), to: self.privatePath)
        self.account.link<&Base{Public}>(self.publicPath, target: self.privatePath)
        
        //self.account
        //.borrow<&Base{Owner}>(from: self.privatePath)!
        //.setHostAddress("temp")
    }
}