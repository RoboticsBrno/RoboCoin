import React from 'react';
import Button from '@/components/Button';

interface FormSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function FormSubmit({ children, ...props }: FormSubmitProps) {
  return (
    <Button type="submit" className="w-full" {...props}>
      {children}
    </Button>
  );
}
