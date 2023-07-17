import logo from './logo.svg';
import './App.css';
import Home from './pages/Home'
import { BrowserRouter as Router,Routes,Route,} from 'react-router-dom';
import Upload from './pages/Upload';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Home/>}/>
        <Route exact path='/upload' element={<Upload/>} />
      </Routes>
    </Router>
  );
}

export default App;
