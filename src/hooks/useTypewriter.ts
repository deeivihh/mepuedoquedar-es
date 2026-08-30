import { useEffect, useState } from "react";

export function useTypewriter(words: string[], typingSpeed = 80, deletingSpeed = 40, pauseMs = 5000) {
    const [displayed, setDisplayed] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!words || words.length === 0) return;

        const currentWord = words[wordIndex % words.length] || "";
        let delay = isDeleting ? deletingSpeed : typingSpeed;
        let action = () => { };

        if (!isDeleting && displayed === currentWord) {
            delay = pauseMs;
            action = () => setIsDeleting(true);
        } else if (isDeleting && displayed === "") {
            delay = typingSpeed;
            action = () => {
                setIsDeleting(false);
                setWordIndex((prev) => (prev + 1) % words.length);
            };
        } else if (isDeleting) {
            action = () => setDisplayed(currentWord.slice(0, displayed.length - 1));
        } else {
            action = () => setDisplayed(currentWord.slice(0, displayed.length + 1));
        }

        const timeout = setTimeout(action, delay);

        return () => clearTimeout(timeout);
    }, [displayed, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseMs]);

    return displayed;
}
