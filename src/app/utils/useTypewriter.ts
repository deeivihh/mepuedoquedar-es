import { useEffect, useState } from "react";

export function useTypewriter(words: string[], typingSpeed = 80, deletingSpeed = 40, pauseMs = 5000) {
    const [displayed, setDisplayed] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const currentWord = words[wordIndex] || "";

    useEffect(() => {
        if (words.length === 0) return;

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (displayed.length < currentWord.length) {
                    setDisplayed(currentWord.slice(0, displayed.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), pauseMs);
                }
            } else {
                if (displayed.length > 0) {
                    setDisplayed(currentWord.slice(0, displayed.length - 1));
                } else {
                    setIsDeleting(false);
                    setWordIndex((prev) => (prev + 1) % words.length);
                }
            }
        }, isDeleting ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timeout);
    }, [displayed, isDeleting, currentWord, words, typingSpeed, deletingSpeed, pauseMs]);

    return displayed;
}