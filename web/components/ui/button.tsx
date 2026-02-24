import * as React from "react"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'secondary' }>(
    ({ className, variant = 'default', ...props }, ref) => {
        let variantClass = "bg-neutral-900 text-white hover:bg-neutral-800"
        if (variant === 'outline') {
            variantClass = "border border-neutral-300 bg-transparent hover:bg-neutral-100 text-neutral-900"
        } else if (variant === 'ghost') {
            variantClass = "bg-transparent hover:bg-neutral-100 text-neutral-900"
        } else if (variant === 'secondary') {
            variantClass = "bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
        }

        return (
            <button
                ref={ref}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${variantClass} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
