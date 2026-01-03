import { HelpCircle } from "lucide-react";
import { useState, type ReactNode } from "react";

interface TooltipProps {
  text: string;
  children?: ReactNode;
  position?: "top" | "bottom"; 
}

const Tooltip = ({ text, children, position }: TooltipProps) => {
  const [show, setShow] = useState(false)


  return (
    <span className="relative inline-block align-baseline ">
      <span
        className="inline-flex items-baseline cursor-help border-b border-dashed "
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ lineHeight: 'inherit' }}
        // Ensures the tooltip icon aligns well with text
      >
        <span className="inline">{children}</span>
        <HelpCircle className="w-3 h-3 ml-1 inline-block " style={{ verticalAlign: 'baseline', position: 'relative', top: '0.05em' }} />
      </span>
      
      {show && (
        <span
          className={`absolute left-1/2 -translate-x-1/2  px-3 py-2 rounded-lg text-sm shadow-xl bg-[#e5e7eb] z-50 w-max ${position === "bottom" ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          {text}
         
        </span>
      )}
    </span>
  )
}
export default Tooltip