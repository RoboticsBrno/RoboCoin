import React from "react";
import Button from "@/components/Button";

interface FormSubmitProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isLoading?: boolean;
}

function FormSubmit({ children, isLoading, ...props }: FormSubmitProps) {
    return (
        <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            {...props}
        >
            {isLoading ? "Loading..." : children}
        </Button>
    );
}

FormSubmit.displayName = "FormSubmit";

export default FormSubmit;
