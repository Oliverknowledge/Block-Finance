
import type buttonProps  from '../types/Button';

const Button: React.FC<buttonProps> = ({children, variant, className, size, onClick, type, disabled}) => {
    return (
        <button onClick = {onClick} className={`btn btn-${variant} btn-${size} ${className}  `} type = {type} disabled={disabled}>
            {children}
        </button>

    );
};

export default Button;
