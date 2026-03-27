import React from "react";

interface SectionHeadingProps {
  title: string;
  description: string;
}
export const SectionHeading = ({ title, description }: SectionHeadingProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
