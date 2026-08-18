"use client";

import { motion } from "framer-motion";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">

      <motion.div
        className="absolute top-[-10rem] left-[-10rem] w-[30rem] h-[30rem] rounded-full bg-purple-500/30 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      <motion.div
        className="absolute bottom-[-10rem] right-[-10rem] w-[30rem] h-[30rem] rounded-full bg-cyan-500/30 blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
      />
    </div>
  );
}