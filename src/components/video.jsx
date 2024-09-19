import YouTube from '../assets/images/youtube.png';

const Video = () => {
    return (
        <>
            <div className="w-full h-full p-6 flex flex-col justify-center items-center text-center">
                <div className="w-full md:w-1/2 h-full p-6 flex flex-col justify-center items-center text-center gap-4">
                    <h1 className="text-white text-4xl text-center pb-10" data-aos="fade-up">Don&apos;t gamble your hard-earned funds on guesswork</h1>
                    <div className="bg-secondary rounded-lg py-[40%] px-[60%] border border-gray-50/5 shadow-sm relative hover:border-gray-50/10" data-aos="fade-up">
                        <div className="p-[5%] rounded-tl-lg border-t border-l border-gray-50/5 shadow-sm w-10 h-10 absolute top-2 left-2"></div>
                        <div className="p-[5%] rounded-bl-lg border-b border-l border-gray-50/5 shadow-sm w-10 h-10 absolute bottom-2 left-2"></div>
                        <div className="p-[5%] rounded-br-lg border-b border-r border-gray-50/5 shadow-sm w-10 h-10 absolute bottom-2 right-2"></div>
                        <div className="p-[5%] rounded-tr-lg border-t border-r border-gray-50/5 shadow-sm w-10 h-10 absolute top-2 right-2"></div>
                        <img src={YouTube} alt="Youtube Icon" className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-all duration-300' />
                    </div>
                    <button className="bg-primary rounded-full py-3 px-6 text-black hover:bg-primary/80">Join Waitlist</button>
                </div>
            </div>
        </>
    )
}

export default Video