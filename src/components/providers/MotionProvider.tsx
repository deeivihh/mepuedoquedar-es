"use client";

import { MotionConfig } from "framer-motion";
import { LazyMotion, domAnimation } from "motion/react";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={domAnimation}>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
    );
}
