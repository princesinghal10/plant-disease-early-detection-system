import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  try {
    // Validate data URL format
    if (!dataurl || !dataurl.startsWith('data:')) {
      console.error('Invalid data URL format');
      throw new Error('Invalid data URL format');
    }
    
    // Split the data URL to get the MIME type and base64 data
    const arr = dataurl.split(',');
    if (arr.length !== 2) {
      console.error('Invalid data URL structure');
      throw new Error('Invalid data URL structure');
    }
    
    // Extract MIME type
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) {
      console.error('Could not extract MIME type from data URL');
      throw new Error('Could not extract MIME type');
    }
    const mime = mimeMatch[1];
    
    // Convert base64 to binary
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    
    // Create and return File object
    const file = new File([u8arr], filename, { type: mime });
    console.log(`Created file from data URL: ${filename}, size: ${file.size} bytes, type: ${file.type}`);
    return file;
  } catch (error) {
    console.error('Error in dataURLtoFile:', error);
    // Return a minimal valid file if conversion fails
    return new File([new Uint8Array(0)], filename, { type: 'image/jpeg' });
  }
}
