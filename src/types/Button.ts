export default interface buttonProps{
    children: React.ReactNode,
    variant: string,
    className?: string,
    size: string,
    onClick?: () => void | Promise<void>,
    type: "submit" | "button" | "reset" | undefined,
}