import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Pages/landing';

function App() {
  
  useEffect(() => {
    AOS.init({
      duration: 1000, // Set animation duration in ms (optional)
      once: true, // Whether animation should happen only once - while scrolling down
    });
  }, []);

  return (
    <>
      <Router>
        <div>
          {/* Define the routes */}
          <Routes>
            {/* Each Route has a 'path' and an element that is rendered */}
            <Route path="/" element={<Landing />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
