
const SwapBar = () => {
    return (
        <div className="bg-secondary p-4 w-full h-full flex justify-between items-center">
            <a href='/'>
                <img src='/images/gen.svg' alt="logo" className="w-full h-full" />
            </a>
            <div className="flex gap-4">
                <div className='py-2 px-6 rounded-md md:flex items-center gap-2 text-white/70 hidden'>
                    <a href='/dashboard' className='py-2 px-6 rounded-md text-white hover:text-white/80 flex items-center gap-2 cursor-pointer font-thin'>
                        New Pairs
                    </a>
                </div>
                <a href='/swap' className='py-2 px-6 rounded-md bg-primary/50 hover:bg-primary/40 text-white flex items-center gap-2 cursor-pointer font-thin'>
                    Connect wallet
                </a>
            </div>
        </div>
    )
}

export default SwapBar