import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Interface for overlay items used in the application
export interface overlay {
  _id: string
  type: "text" | "image"
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
}