import Button from "./Button";
import { useNavigate, useLocation } from "react-router-dom";
import { Links } from "../lib/links";
import { Toggle } from "./DMLMToggle";

  const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {pathname } = location;
    return (
              
<nav className="w-full z-20 top-0 start-0 border-b border-[var(--border-color)] bg-[var(--surface-color)]/95 backdrop-blur-xl shadow-sm">
  <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto px-6 md:px-10 py-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md grid place-items-center text-white">
        <span className="font-bold">BF</span>
      </div>
      <a href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
        <span className="self-center text-lg font-semibold tracking-tight">Block Finance</span>
      </a>
    </div>
    <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-xl md:hidden hover:bg-[var(--muted-surface-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/30" aria-controls="navbar-default" aria-expanded="false">
      <span className="sr-only">Open main menu</span>
      <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14"/></svg>
    </button>
    <div className="hidden w-full md:block md:w-auto" id="navbar-default">
      <ul className="flex flex-col md:flex-row md:items-center gap-2 p-4 md:p-0 mt-4 md:mt-0">
        {Links.map((item) => (
          <li key={item.link}>
            <Button
              onClick={() => navigate(item.link)}
              type="button"
              variant={pathname === item.link ? 'primary' : 'secondary'}
              size="md"
              className="!rounded-xl"
            >
              {item.name}
            </Button>
          </li>
        ))}
        <li className="mt-3 md:mt-0 md:ml-2">
          <Toggle />
        </li>
      </ul>
    </div>
  </div>
</nav>

  
    );
  };
export default Navbar

