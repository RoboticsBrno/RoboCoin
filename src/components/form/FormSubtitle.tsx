import React from "react";

interface FormSubtitleProps {
    children: React.ReactNode;
}

export default function FormSubtitle({ children }: FormSubtitleProps) {
    return <p className="mt-2 text-sm text-center text-gray-400">{children}</p>;
}
