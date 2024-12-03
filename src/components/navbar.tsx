import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="bg-secondary p-4 w-full h-full flex justify-between items-center">
      <Link to="/">
        <img src="/images/gen.svg" alt="logo" className="w-full h-full" />
      </Link>
      <div className="flex gap-4">
        <Link
          to="/home"
          className="py-2 px-6 rounded-md text-white flex items-center gap-2 font-thin cursor-pointer border border-primary/10 bg-primary/10 hover:bg-primary/20 hover:text-white/100 transition-all duration-300 shadow-md hover:shadow-primary/30"
        >
          Launch app
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
