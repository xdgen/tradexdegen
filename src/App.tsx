import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Landing from './Pages/landing';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Newpairs from './Pages/Dashboard/newPairs/newpairs'

function App() {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      once: true,     // Whether animation should happen only once
    });
  }, []);

  return (
    <Router>
     
      {/* <Landing /> */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/newpairs" element={<Newpairs  />} />
      </Routes>
   
    </Router>
  )
}

export default App