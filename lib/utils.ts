import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian currency (₹)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert a number to words (Indian Rupees format)
 */
export function convertToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const numToWord = (num: number): string => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numToWord(num % 100) : '');
    if (num < 100000) return numToWord(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numToWord(num % 1000) : '');
    if (num < 10000000) return numToWord(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numToWord(num % 100000) : '');
    return numToWord(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numToWord(num % 10000000) : '');
  };

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = numToWord(rupees);
  
  if (paise > 0) {
    result += ' and ' + numToWord(paise) + ' Paise';
  }
  
  return result;
}
