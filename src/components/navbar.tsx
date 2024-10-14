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
          className="py-2 px-6 rounded-md bg-gray-400/10 text-white/70 flex items-center gap-2 font-thin cursor-pointer"
        >
          Launch app
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
