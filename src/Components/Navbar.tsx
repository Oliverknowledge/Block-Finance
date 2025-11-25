import Button from "./Button";
import { useNavigate, useLocation } from "react-router-dom";
import { Links } from "../lib/links";
import { Toggle } from "./DMLMToggle";

  const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {pathname } = location;
    return (
      <nav className = "">
        <div className="max-w-screen-2xl flex flex-wrap items-center justify-between mx-auto p-4 w-full border-gray-200">

          <a
            href="/"
            className="text-2xl font-semibold whitespace-nowrap dark:text-white ml-10"
          >
            Block Finance
          </a>
  
          
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8  md:mt-0 md:border-0">
  
              {Links.map((item) => (
                <li key={item.link}>
                    <Button
                    onClick={() => navigate(item.link)}
                    type="button"
                    variant="secondary"
                    size="md"
                    //Created a template string that checked whether the pathname is equal to the link and changed the color of the text accordingly to blue.
                    className={` ${pathname === item.link ? "!text-blue-500" : ""} `}
                  >
                    {item.name}
                  </Button>
                  
                </li>
              ))}
            <Toggle/>
            </ul>
            
          </div>

      </nav>
    );
  };
export default Navbar



