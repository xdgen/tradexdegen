
const Navbar = () => {
  return (
    <div className="bg-secondary p-4 w-full h-full flex justify-between items-center">
      <div className=''>
        <img src='/images/logo.svg' alt="logo" className="w-full h-full" />
      </div>
      <div className="flex gap-4">
        <div className='py-2 px-6 rounded-md bg-gray-400/10 md:flex items-center gap-2 text-white/70 hidden'>
          <img src='/images/play.png' alt="logo" className="w-6 h-6" />
          <button className="" disabled>App coming soon.</button>
        </div>
        <button disabled className='py-2 px-6 rounded-md bg-gray-400/10 text-white/70 flex items-center gap-2 cursor-not-allowed font-thin'>
          Launch app
        </button>
      </div>
    </div>
  )
}

export default Navbar