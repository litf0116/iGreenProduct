import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: Date | string | undefined | null): string {
    if (!date) return "-"
    let dateObj: Date
    if (typeof date === "string") {
        dateObj = new Date(date.replace(" ", "T"))
        if (isNaN(dateObj.getTime())) return date
    } else {
        dateObj = date
    }
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    const seconds = String(dateObj.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function formatDate(date: Date | string | undefined | null): string {
    if (!date) return "-"
    let dateObj: Date
    if (typeof date === "string") {
        dateObj = new Date(date.replace(" ", "T"))
        if (isNaN(dateObj.getTime())) return date
    } else {
        dateObj = date
    }
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
