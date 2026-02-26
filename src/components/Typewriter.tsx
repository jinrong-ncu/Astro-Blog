import React, { useState, useEffect } from "react";

interface TypewriterProps {
    text: string[];
    speed?: number;
    waitTime?: number;
    deleteSpeed?: number;
    cursorChar?: string;
}

export const Typewriter = ({
    text,
    speed = 100,
    waitTime = 2000,
    deleteSpeed = 50,
    cursorChar = "|",
}: TypewriterProps) => {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentString = text[currentIndex % text.length];

        const type = () => {
            if (isDeleting) {
                setDisplayText((prev) => prev.slice(0, -1));
            } else {
                setDisplayText((prev) => currentString.slice(0, prev.length + 1));
            }
        };

        let timer: NodeJS.Timeout;

        if (!isDeleting && displayText === currentString) {
            // Finished typing, wait before deleting
            timer = setTimeout(() => setIsDeleting(true), waitTime);
        } else if (isDeleting && displayText === "") {
            // Finished deleting, move to next string and start typing
            setIsDeleting(false);
            setCurrentIndex((prev) => prev + 1);
        } else {
            // Typing or deleting characters
            timer = setTimeout(type, isDeleting ? deleteSpeed : speed);
        }

        return () => clearTimeout(timer);
    }, [displayText, isDeleting, currentIndex, text, speed, waitTime, deleteSpeed]);

    return (
        <span className="inline-block">
            <span className="whitespace-pre-wrap">{displayText}</span>
            <span className="animate-pulse">{cursorChar}</span>
        </span>
    );
};
