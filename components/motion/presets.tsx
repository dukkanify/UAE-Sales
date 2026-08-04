"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";
import { motion as tokens } from "@/config/design-system";

function PageTransition({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={tokens.page}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({
  children,
  className,
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...tokens.fade, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function HoverLift({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(className)}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.99 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { PageTransition, FadeIn, HoverLift };
