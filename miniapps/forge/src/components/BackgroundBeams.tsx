"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full bg-neutral-950 flex flex-col items-center justify-center overflow-hidden antialiased",
        className
      )}
    >
        <div className="absolute inset-0 bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-spin-slow opacity-30">
                <div className="absolute top-[50%] left-[50%] w-[50%] h-[50%] bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[100px] translate-x-[-50%] translate-y-[-50%] rotate-45"></div>
                <div className="absolute top-[50%] left-[50%] w-[50%] h-[50%] bg-gradient-to-r from-transparent via-red-500 to-transparent blur-[100px] translate-x-[-50%] translate-y-[-50%] -rotate-45"></div>
            </div>
        </div>
    </div>
  );
};
