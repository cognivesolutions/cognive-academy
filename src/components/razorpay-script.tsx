'use client';

export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay can only be loaded in the browser.'));
      return;
    }

    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[data-razorpay-sdk="true"]');

    if (existingScript instanceof HTMLScriptElement) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout script.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpaySdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
    document.head.appendChild(script);
  });
}

export default function RazorpayScript() {
  return null;
}
