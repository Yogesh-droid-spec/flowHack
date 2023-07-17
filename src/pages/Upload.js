import React, {useEffect, useState} from 'react'
import {getHostList} from '../flow/cadence/scripts/getHostList'
import {updateHostStatus} from '../flow/cadence/transactions/updateHostStatus'
import * as fcl from "@onflow/fcl";
import * as types from '@onflow/types';

fcl.config({
  "app.detail.title":"Decentralized Hosting",
  "app.detail.icon":"https://i.imgur.com/ux3lYB9.png",
  "accessNode.api":"https://rest-testnet.onflow.org",
  "discovery.wallet":"https://fcl-discovery.onflow.org/testnet/authn",
  "0xDeployer":"0xd64cbb21bf1c30ee",
})

function Upload() {
    const [user,setUser] = useState({loggedIn:false})
    const [file,setFile] = useState("")
    const [list,setList] = useState(["pip install -r requirements.txt","python main.py"]) 
    const [hostList,setHostList] = useState([])
    const handleChange = (e)=>{
        const file = e.target.files[0];
        setFile(file);
    }
    const login = () => {
      fcl.authenticate()
      fcl.currentUser().subscribe(setUser);
    }
    const uploadClicked = () => {
        // set file, list to user's profile
    }
    async function fetchHostList(){
      const result = await fcl.send([
        fcl.script(getHostList)
      ]).then( fcl.decode);
      console.log(result);
      setHostList(result);
    }
    async function setStatus(){
      const transactionId = await fcl.send([
        fcl.transaction(updateHostStatus),
        fcl.args([
          fcl.arg(true,types.Bool)
        ]),
        fcl.payer(fcl.currentUser),
        fcl.proposer(fcl.currentUser),
        fcl.authorizations([fcl.currentUser]),
        fcl.limit(9999)
      ]).then(fcl.decode)
      // .then((res)=> 
      //   console.log(res) // <- also gives transaction id
      // )
      console.log("transaction id : ",transactionId);
    }

    useEffect(()=>{
      console.log("useEffect")
      let contractAddress = "d64cbb21bf1c30ee";
      let contractName = "Profile";
      let eventName = "hostAddressChanged";
      const event = `A.${contractAddress}.${contractName}.${eventName}`;
      // const latestBlock = await fcl.send([
      //   fcl.getBlock(true)
      // ]).then(fcl.decode)
      // console.log(latestBlock.height)
      // if (latestBlock){
      //   console.log("hi");
      // }
      fcl.events(event).subscribe((eventData)=>{
        console.log(eventData);
        console.log(eventData.target_address)
        //
      })
    },[])

  return (
    <div>
        <button onClick={()=>login()}>login</button><br/><br/>
        Account address : {user && user.addr ? user.addr : "No address"}
        <br/><br/>
        <input type="file" onChange={handleChange} />
        <br/>
        <br/>
        <button onClick={()=>fetchHostList()}>Get Host List</button><br/>
        {
          hostList.map((host_address,idx)=>
            <div key={idx}>
              {host_address}
              <br/>
            </div>
          )
        }
        <br/><br/>
        <button onClick={()=>setStatus()}>set your active status</button><br/><br/>
    </div>
  )
}

export default Upload