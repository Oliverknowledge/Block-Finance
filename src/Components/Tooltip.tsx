import { useState, type ReactNode } from "react";

interface TooltipProps {
  text: string;
  size?: number | string;
  className?: string;
  children?: ReactNode;
  position?: "top" | "bottom"; 
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  size = 24,
  className = "",
  children,
  position = "bottom",
}) => {
  const [show, setShow] = useState(false);

  const trigger = children ? (
    children
  ) : (
    <img src="/tooltipDark.svg" width={size} height={size} />
  );


  const tooltipPositionClasses =
    position === "top"
      ? "bottom-full mb-2" 
      : "top-full mt-2"; 

 

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className="flex items-center justify-center cursor-pointer"
        style={{ width: size, height: size }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {trigger}

      
        <div
          className={`
            absolute left-1/2 -translate-x-1/2 ${tooltipPositionClasses}
            px-3 py-1.5
            rounded-lg  text-white text-sm shadow-lg
            transition-all duration-200 whitespace-nowrap z-50
            ${show ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
          `}
        >
          {text}

         
         
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
