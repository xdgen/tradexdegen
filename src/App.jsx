import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
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
      <Landing />
    </>
  )
}

export default App
