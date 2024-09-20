import Logo from '../assets/logo.png'

const Footer = () => {


    return (
        <footer className="bg-background text-white py-8">
            <div className="container mx-auto lg:px-[10%] flex flex-col md:flex-row justify-between items-center" data-aos="fade-up">
                <div className="flex items-center mb-6 md:mb-0">
                    <div className='w-[70px] h-[18px]'>
                        <img src={Logo} alt="logo" className="w-full h-full" />
                    </div>
                </div>

                {/* Right Section - Newsletter */}
                <div className="text-center md:text-right justify-start flex flex-col items-start">
                    <h4 className="text-lg font-semibold">Join our newsletter</h4>
                    <p className="text-gray-400 mb-4 text-sm">
                        Be the first to know when we launch new updates
                    </p>
                    <form className="flex justify-center md:justify-end gap-6">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-secondary text-white p-3 rounded-l-md focus:outline-none rounded-lg"
                        />
                        <button className="bg-primary rounded-full py-3 px-6 text-black hover:bg-primary/80">Join</button>
                    </form>
                </div>
            </div>
            {/* Copyright */}
            <div className="mt-6 text-center text-white/80 w-full border-t border-secondary pt-4">
                ©2024 All rights reserved xdgen.com
            </div>
        </footer>
    );
};

export default Footer;
