
import { useTheme } from "../hooks/useTheme";
import Button from "./Button";
export const Toggle = () => {
  const {isDark, toggleTheme} = useTheme();
  return (
    <Button 
      onClick={toggleTheme} 
      size="lg" 
      type="button" 
      variant="secondary"
    >
      {isDark ? <img className = "w-5 h-5" src = "/public/sun.svg"/> : <img className = "w-5 h-5" src = "/public/moon.svg"/>}
    </Button>
  );
};