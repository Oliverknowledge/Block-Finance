import Button from "./Button";
import { useNavigate, useLocation } from "react-router-dom";
import { Links } from "../lib/links";
import { Toggle } from "./DMLMToggle";

  const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {pathname } = location;
    return (
     
              
<nav className="bg-neutral-primary  w-full z-20 top-0 start-0 ">
  <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">
    <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
        
        <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">Block Finance</span>
    </a>
    <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary" aria-controls="navbar-default" aria-expanded="false">
        <span className="sr-only">Open main menu</span>
        <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14"/></svg>
    </button>
    <div className="hidden w-full md:block md:w-auto" id="navbar-default">
    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8  md:mt-0 md:border-0">
  
  {Links.map((item) => (
    <li key={item.link}>
        <Button
        onClick={() => navigate(item.link)}
        type="button"
        variant="secondary"
        size="md"
        className={` ${pathname === item.link ? 'text-gray-800' : ''} `}
      >
        {item.name}
      </Button>
      
    </li>
  ))}
<Toggle/>
</ul>
    </div>
  </div>
</nav>

  
    );
  };
export default Navbar

