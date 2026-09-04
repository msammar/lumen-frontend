import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/ui class combiner: clsx for conditionals, tailwind-merge to dedupe
 *  conflicting utilities (e.g. `px-2` + `px-4` -> `px-4`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
