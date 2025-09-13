"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface LoaderOneProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function LoaderOne({ 
  className, 
  size = "md", 
  color = "rgb(59, 130, 246)" 
}: LoaderOneProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className={cn("relative", sizeClasses[size])}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: color,
            borderRightColor: `${color}66`,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: color,
            borderLeftColor: `${color}66`,
          }}
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            backgroundColor: `${color}33`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
}