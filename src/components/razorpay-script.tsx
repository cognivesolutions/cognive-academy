'use client';

import { useEffect } from 'react';

export default function RazorpayScript() {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-razorpay-sdk="true"]');

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpaySdk = 'true';
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
