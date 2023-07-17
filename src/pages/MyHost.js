import React,{useEffect, useState} from 'react'
import * as fcl from "@onflow/fcl";
import * as types from '@onflow/types';
import { getBalance } from '../flow/cadence/scripts/getBalance';
import { getUserInfo } from '../flow/cadence/scripts/getUserInfo';
import { getHostList } from '../flow/cadence/scripts/getHostList';
import { hostSite } from '../flow/cadence/transactions/hostSite';
import { clientsetEndPoint } from '../flow/cadence/transactions/setEndPoint';
import { stopHosting } from '../flow/cadence/transactions/stopHosting';
import '../utils/index.css'

import PropTypes from 'prop-types';
import { Divider,List,ListItem,ListItemButton,ListItemText,Box, AppBar, CssBaseline, Drawer, IconButton, Toolbar, Typography, Button, Experimental_CssVarsProvider  } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate,Link } from 'react-router-dom';
import Background from '../utils/lecture.jpg'

fcl.config({
  "app.detail.title":"Bank Account",
  "app.detail.icon":"https://i.imgur.com/ux3lYB9.png",
  "accessNode.api":"https://rest-testnet.onflow.org",
  "discovery.wallet":"https://fcl-discovery.onflow.org/testnet/authn",
  "0xDeployer":"0x98a3cd56e465cf78",
})
//old-deployer-acc = 0x98a3cd56e465cf78
//shaleen-flipper = 0xd64cbb21bf1c30ee


function Home(props) {
  const navigate = useNavigate();

  

  const [file,setFile] = useState("")
  const [balance,setBalance] = useState(0);
  const[targetAddress,setTargetAddress] = useState("");
  const[user,setUser] = useState({loggedIn:false})
  const [commands,setCommands] = useState([])
  const [fileUrl,setFileUrl] = useState("")
  const [endPoint,setEndPoint] = useState("")
  
  const [hostList,setHostList] = useState([])
  const [hostAddress,setHostAddress] = useState("-1")
  const siteHostedEvent = "A.d64cbb21bf1c30ee.User.siteHosted";

  useEffect(()=>{
    if (user && user.addr){
      console.log("fetch balance, user.addr",user.addr)
      getBal();
      getInfo();
    }
  },[user])

  useEffect(()=>{
    if (hostAddress==="-1"){
      // do nothing
    }
    else if (hostAddress===""){
      fetchHostList();
    }else{
      navigate("/"+hostAddress)
    }
  },[hostAddress])
  
  const handleChange = (e)=>{
    const file = e.target.files[0];
    setFile(file);
  }

  const login = () => {
    fcl.authenticate()
    fcl.currentUser().subscribe(setUser);
  }
  const logout = () => {
    fcl.unauthenticate();
  }
  async function fetchHostList(){
    const result = await fcl.send([
      fcl.script(getHostList)
    ]).then( fcl.decode);
    console.log(result);
    setHostList(result);
  }
  async function getBal(){
    console.log("get balance called")
    const result = await fcl.send([
      fcl.script(getBalance),
      fcl.args([
        fcl.arg(user.addr,types.Address)
      ])
    ]).then( fcl.decode);
    console.log(result);
    setBalance(result);
  }
  async function getInfo(){
    console.log("get info called")
    const result = await fcl.send([
      fcl.script(getUserInfo),
      fcl.args([
        fcl.arg(user.addr,types.Address)
      ])
    ]).then(fcl.decode);
    console.log(result);
    setHostAddress(result.hostAddress)
  }
  async function upload(){
    // upload to drive first
    const amount = "10.0"
    const transactionId = await fcl.send([
      fcl.transaction(hostSite),
      fcl.args([
        fcl.arg("https://drive.com",types.String),
        fcl.arg(["pip install","python run"],types.Array(types.String)),
        fcl.arg(targetAddress,types.String),
        fcl.arg(amount,types.UFix64),
        fcl.arg(targetAddress,types.Address)
      ]),
      fcl.payer(fcl.currentUser),
      fcl.proposer(fcl.currentUser),
      fcl.authorizations([fcl.currentUser]),
      fcl.limit(9999)
    ]).then(fcl.decode);
    console.log("transaction id : ",transactionId);
    
    if (transactionId){
      // addlistener now
      console.log("listening for end point")
      fcl.events(siteHostedEvent).subscribe((eventData)=>{
        console.log("\endpoint arrived : ",eventData);
        if (eventData.clientAddress===user.addr){
          setEndPoint(eventData.endPoint)
        }
      })
    }
  }

  async function saveEndPoint(){
    const transactionId = await fcl.send([
      fcl.transaction(clientsetEndPoint),
      fcl.args([
        fcl.arg(endPoint,types.String)
      ]),
      fcl.payer(fcl.currentUser),
      fcl.proposer(fcl.currentUser),
      fcl.authorizations([fcl.currentUser]),
      fcl.limit(9999)
    ]).then(fcl.decode);
    console.log("end point uploaded success, tId : ",transactionId)
  }

  async function stopHostingClicked(){
    console.log("requesting to stop hosting")
    const transactionId = await fcl.send([
      fcl.transaction(stopHosting),
      fcl.args([]),
      fcl.payer(fcl.currentUser),
      fcl.proposer(fcl.currentUser),
      fcl.authorizations([fcl.currentUser]),
      fcl.limit(9999)
    ]).then(fcl.decode);
    console.log("stop hosting called, tId : ",transactionId)
  }

  return (
    <div>
    {
    user && user.addr ? (
    <Box >
      <br/><br/><br/>
      <input type="file" onChange={handleChange} />
      <br/>
      target address:<input onChange={(e)=>setTargetAddress(e.target.value)} /><br/>
      <button onClick={upload}>send request/upload</button><br/><br/>
      {
        hostList.map((host_address,idx)=>(
          <div key={idx}>{host_address}<br/></div>
        ))
      }
      <br/><br/>
      {endPoint}
      <button onClick={saveEndPoint}>save end point</button>

      <br/><br/><br/><br/>
      <button onClick={stopHostingClicked}>stop hosting</button>
    </Box>
    ) : (

    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav" style={{backgroundColor:'#333333'}}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Edumade
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: '#fff' }}>
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ p: 3 ,textAlign:'center'}} style={{ backgroundImage: `url(${Background})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh', width: '100vw' }}>
        <Toolbar />
        <Box m={7} pt={10} >
          <Typography className='title' style={{fontSize:'150px'}} variant="h1" gutterBottom >Free Flow</Typography>
          <Typography className='heading' variant="subtitle1" style={{color:'#F1F6F9',fontSize:'25px'}}>
            A Decentralized Hosting Platform
          </Typography>
          <br/>
          <div>
            <Button onClick={login}>
              <button className="button-64" role="button"><span className="text">Sign in</span></button>
            </Button>
          </div>
        </Box>
      </Box>
    </Box>
    )
    }
    </div>
  )
}

export default Home
