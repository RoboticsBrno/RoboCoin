import React from "react";

interface FormGroupProps {
    children: React.ReactNode;
}

export default function FormGroup({ children }: FormGroupProps) {
    return <div className="space-y-1">{children}</div>;
}
