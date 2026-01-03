
import type buttonProps  from '../types/Button';
//Retrieve button props from the buttonProps interface



const Button: React.FC<buttonProps> = ({children, variant, className, size, onClick, type, disabled}) => {
    //Creates a forward component so that the children can be passed like a regular button: <Button> text</Button>.
    
    //Receives button props - text, variant, className, size
    return (
        <button onClick = {onClick} className={`btn btn-${variant} btn-${size} ${className}  `} type = {type} disabled={disabled}>
            {children}
        </button>

    );
};

export default Button;