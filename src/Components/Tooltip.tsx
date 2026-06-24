import { HelpCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children?: ReactNode;
  position?: 'top' | 'bottom';
}

const Tooltip = ({ text, children, position = 'top' }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const tooltipPositionClass = position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

  const accessibleLabel =
    typeof children === 'string' && children.trim() !== '' ? `More info about ${children}` : 'More info';

  return (
    <span className="relative inline-flex align-baseline">
      <span
        role="button"
        tabIndex={0}
        className="inline-flex items-baseline cursor-help border-b border-dashed border-current bg-transparent p-0"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
        style={{ lineHeight: 'inherit' }}
        aria-label={accessibleLabel}
        aria-expanded={open}
      >
        <span className="inline">{children}</span>
        <HelpCircle className="ml-1 inline-block h-3 w-3" style={{ verticalAlign: 'baseline', position: 'relative', top: '0.05em' }} />
      </span>

      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-[70] w-max max-w-xs -translate-x-1/2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2 text-xs shadow-xl ${tooltipPositionClass}`}
          style={{ color: 'var(--text-color)' }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
