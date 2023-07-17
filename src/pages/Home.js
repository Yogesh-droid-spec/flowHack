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

import { Paper,Divider,List,ListItem,ListItemButton,ListItemText,Box, AppBar, CssBaseline, Drawer, IconButton, Toolbar, Typography, Button, Experimental_CssVarsProvider  } from '@mui/material';
import TextField from '@mui/material/TextField';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate,Link } from 'react-router-dom';
import Background from '../utils/lecture.jpg'
import Background2 from '../utils/flowimage.png'
import Background3 from '../utils/flowimage2.png'
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


fcl.config({
  "app.detail.title":"Bank Account",
  "app.detail.icon":"https://i.imgur.com/ux3lYB9.png",
  "accessNode.api":"https://rest-testnet.onflow.org",
  "discovery.wallet":"https://fcl-discovery.onflow.org/testnet/authn",
  "0xDeployer":"0x98a3cd56e465cf78",
})
//old-deployer-acc = 0x98a3cd56e465cf78
//shaleen-flipper = 0xd64cbb21bf1c30ee

const drawerWidth = 240;
const navItems = ['About', 'Services', 'Contact'];

function Home(props) {
  const subImg = ["./download1.png",'./download2.png',"./download3.png",'./download4.jpg','./download5.jpg']
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MUI
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
  const container = window !== undefined ? () => window().document.body : undefined;

  const [balance,setBalance] = useState(0);
  const[targetAddress,setTargetAddress] = useState("");
  const[user,setUser] = useState({loggedIn:false})
  const [textCommands,setTextCommands] = useState("")
  const [commands,setCommands] = useState()
  const [tempCommands,setTempCommands] = useState();
  const [fileUrl,setFileUrl] = useState("")
  const [endPoint,setEndPoint] = useState("")
  const [file,setFile] = useState("")
  const [hostList,setHostList] = useState([])
  const [hostAddress,setHostAddress] = useState("-1")
  const [endPointSaved,setEndPointSaved] = useState(true);
  const [waitingState,setWaitingState] = useState(false);
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
      setTargetAddress(hostAddress)
    }
  },[hostAddress])
  
  const handleCommandTextChange = (event) => {
    const { value } = event.target;
    setTextCommands(value);
    const lines = value.split('\n');
    setTempCommands(lines);
  };
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
    setTargetAddress(result.hostAddress)
    setEndPoint(result.endPoint)
    setCommands(result.commands)
    setTextCommands(result.commands.join('\r\n'))
    setTempCommands(result.commands)
  }
  async function upload(){
    const file_url = ""
    const amount = "10.0"
    const transactionId = await fcl.send([
      fcl.transaction(hostSite),
      fcl.args([
        fcl.arg(fileUrl,types.String),
        fcl.arg(tempCommands,types.Array(types.String)),
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
      setWaitingState(true)
      fcl.events(siteHostedEvent).subscribe((eventData)=>{
        console.log("\endpoint arrived : ",eventData);
        if (eventData.clientAddress===user.addr){
          setEndPoint(eventData.endPoint)
          setEndPointSaved(false);
          setWaitingState(false);
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

  function handle(){
    console.log("hello")
  }

  return (
    <div>
    {
    user && user.addr ? (
    <Box >
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
          {
            targetAddress==="" ? (
              <></>
            ): (
              <>
              <ArrowBackIcon onClick={()=>setTargetAddress("")}/>
              &nbsp;&nbsp;
              </>
            )
          }
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Free FLow
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Button key="Account" sx={{ color: '#fff' }}>{user.addr}</Button>
              <Button key="Balance" sx={{ color: '#fff' }}>{balance}&nbsp; <MonetizationOnIcon/> &nbsp;</Button>
              <Button onClick={logout} key="logout" variant='contained' sx={{ color: '#fff' }}>log out</Button>
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
      <Box component="main" sx={{ p: 3 ,textAlign:'center'}} style={{ backgroundImage: `url(${Background3})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh', width: '100vw' }}>
      <br/><br/><br/>
      {
        targetAddress==="" ? (
          <Box sx={{display:"flex"}}>
            {
              hostList.map((host_address,idx)=>(
                <Paper
                    style={{ border: ` 25` }}
                    sx={{
                      height: 300,
                      width: 300,
                      backgroundColor: '#F1F6F9',
                      borderRadius: '8',
                      margin:"30px"
                    }}
                    onClick={()=>setTargetAddress(host_address)}
                  >
                    <div style={{ position: 'relative', height: '100%' }}>
                      <img
                        src={subImg[idx]}
                        alt="Subject Image"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    </div>
                    <Box p={1}>
                      <Typography className='heading' color={'black'} variant="h5">{host_address}</Typography>
                    </Box>
                  </Paper>
              ))
            }
          </Box>
        ) : (
          <Box>
            <br/>
            <Typography>Host Id : {targetAddress}</Typography>
            <br/>
            <center>
              <Box sx={{maxWidth:"800px"}}>
                <TextField
                  label="File Url"
                />
                <br/>
                <br/>
                <TextField
                  fullWidth
                  id="outlined-multiline-flexible"
                  label="Commands"
                  multiline
                  value={textCommands}
                  onChange={handleCommandTextChange}
                  maxRows={20}
                />
              </Box>
            </center>
            <br/>
            <br/>
            <Button variant='contained' color='success' onClick={upload}>send request/upload</Button><br/><br/>
            {
              waitingState ? (
                <CircularProgress />
              ) : (
                <></>
              )
            }
            <br/>
            {endPoint.length!=0 ? 
            (
              <Box>
                <Typography>{endPoint}</Typography>
                <br/>
                {
                  endPointSaved ? (
                    <></>
                  ) : (
                    <Button variant='contained' onClick={saveEndPoint}>save end point</Button>
                  )
                }
                <br/>
                
              </Box>
            ):(
              <Box></Box>
            )
            }
            <Button variant='contained' color='error' onClick={stopHostingClicked}>stop hosting</Button>
          </Box>
        )
      }
      </Box>
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
            Free Flow
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
      <Box component="main" sx={{ p: 3 ,textAlign:'center'}} style={{ backgroundImage: `url(${Background2})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh', width: '100vw' }}>
        <Toolbar />
        <Box m={7} pt={10} >
        <br/><br/><br/><br/><br/><br/><br/><br/>
          <Typography className='heading' variant="subtitle1" style={{color:'black',fontSize:'25px'}}>
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
