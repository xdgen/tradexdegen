import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="bg-secondary p-4 w-full h-full flex justify-between items-center">
      <div className='w-[70px] h-[18px]'>
        <img src='/images/logo.png' alt="logo" className="w-full h-full" />
      </div>
      <div className='py-2 px-6 rounded-md  text-white hover:bg-green-600 transition-all duration-300 ease-in-out'>
        <Link to="/newpairs">
          DashBoard
        </Link>
      </div>
      <div className='py-2 px-6 rounded-md bg-gray-400/10 text-white/50 hover:text-white hover:bg-gray-400/20 transition-all duration-300 ease-in-out flex items-center gap-2'>
        <img src='/images/play.png' alt="logo" className="w-6 h-6" />
        <button className="" disabled>App coming soon.</button>
      </div>
    </div>
  )
}

export default Navbar