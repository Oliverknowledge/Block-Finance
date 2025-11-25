import { useEffect } from "react";
import Button from "./Button";
import useLocalStorage from "use-local-storage";

export const Toggle = () => {
  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("isDark", preference);

  useEffect(() => {
    const root = document.documentElement; // Fetches the root styling element
    if (isDark) {
      root.setAttribute("data-theme", "dark"); // Sets the data-theme to dark
    } else {
      root.setAttribute("data-theme", "light"); // Sets the data-theme to light
    }
    //Each time the isDark variable changes the useEffect is triggered
  }, [isDark]);

  const handleToggle = () => {
    setIsDark(!isDark);
  };

  return (
    <Button 
      onClick={handleToggle} 
      size="lg" 
      type="button" 
      variant="secondary"
    >
      {isDark ? <img className = "w-5 h-5" src = "/public/sun.svg"/> : <img className = "w-5 h-5" src = "/public/moon.svg"/>}
    </Button>
  );
};