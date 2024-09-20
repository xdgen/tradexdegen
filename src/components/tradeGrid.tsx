export default function CryptoGrid() {
    return (
        <div className=" text-white min-h-screen mt-10 strips">
            <div className="w-full flex flex-col gap-10">
                <div className="flex flex-col lg:flex-row justify-between items-center w-full lg:col-span-2">
                    <div className='p-6'>
                        <h2 className="text-4xl font-bold mb-4" data-aos="fade-up">Trading Hurt&apos;s, Doesn&apos;t It?</h2>
                        <p className='text-gray-400 text-xl font-thin' data-aos="fade-up">Jumping headfirst into crypto markets with no funds is a risky move. One wrong move and you&apos;re staring at a red portfolio.</p>
                    </div>
                    <img src="/images/trading.png" alt='' className="w-[80%] h-[80%] object-cover rounded-lg" data-aos="zoom-in" />
                </div>
                <div className="flex flex-col lg:flex-row justify-between items-center w-full lg:col-span-2 py-10">
                    <img src='/images/about.png' alt='' className="w-[80%] h-[80%] object-cover rounded-lg" data-aos="zoom-in" />
                    <div className='p-6'>
                        <h2 className="text-4xl font-bold mb-4" data-aos="fade-up">About us</h2>
                        <p className='text-gray-400 text-xl font-thin' data-aos="fade-up">At Xdegen, we believe that every trader deserves a chance to practice and perfect their strategies before entering the fast-paced crypto markets. We&apos;ve created a simulation of real-time markets, giving you a risk-free environment to learn, experiment, and build confidence</p>
                        <p className='text-gray-400 text-xl py-6 font-thin' data-aos="fade-up">Whether you&apos;re a new trader or an experienced trader, We&apos;re here to help you sharpen your skills without the pressure of losing real funds</p>
                    </div>
                </div>
            </div>
        </div>
    )
}