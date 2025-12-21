import {  useEffect, type ReactNode } from "react";
import useLocalStorage from "use-local-storage";
import { ThemeContext } from "../hooks/useTheme"



export const ThemeProvider = ({ children }: { children: ReactNode }) => {
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
  const toggleTheme = () => {
    setIsDark(!isDark);
  };


  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

