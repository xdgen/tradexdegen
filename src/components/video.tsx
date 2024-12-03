import Waitlist from '../components/waitlist'

const Video = () => {
    return (
        <div className="w-full min-h-screen p-6 flex flex-col justify-center items-center text-center bg-gradient-to-b from-background to-secondary">
            <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col justify-center items-center text-center gap-8">
                <h1 className="text-primary text-4xl font-bold text-center pb-6" data-aos="fade-up">
                    Don&apos;t gamble your hard-earned funds on guesswork
                </h1>
                <div className="w-full aspect-video bg-secondary rounded-lg border border-gray-50/10 shadow-lg relative overflow-hidden" data-aos="fade-up">
                    <video 
                        className="w-full h-full object-cover"
                        controls
                        poster="../../public/images/trading.png"
                    >
                        <source src="../../public/images/vid.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    {/* <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <button className="bg-primary text-primary-foreground rounded-full p-4 hover:bg-primary/90 transition-colors duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div> */}
                </div>
                <Waitlist />
            </div>
        </div>
    )
}

export default Video

