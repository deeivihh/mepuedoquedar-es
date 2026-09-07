import React from "react";
import { RiExternalLinkFill } from "react-icons/ri";

interface SourceProps {
    href?: string;
    children?: React.ReactNode;
    name?: string;
    className?: string;
    section?: string;
}

export default function Source({ href, children, name, className = "", section = "" }: SourceProps) {
    const content = children ?? name;

    return (
        <p className={`${section === "" ? "mt-3 px-0.5" : "mt-0"} gap-1 flex items-center text-[10px] text-title/50 group relative w-fit ${className}`.trim()}>
            <span>Fuente:</span>
            {href ? (
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group-hover:text-text-2 transition-colors duration-150 flex items-center justify-center gap-1"
                    href={href}
                >
                    {content}
                    <span aria-hidden="true"><RiExternalLinkFill className="mb-0.5 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 blur group-hover:blur-none transition-[opacity, margin, blur] duration-150" /></span>
                </a>
            ) : (
                <span>{content}</span>
            )}
        </p>
    );
}
