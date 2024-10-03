import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Landing from './Pages/landing/Landing';

function App() {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      once: true,     // Whether animation should happen only once
    });
  }, []);

  return (
    <>
      <Landing />
    </>
  )
}

export default App
