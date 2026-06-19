"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
// This component scrolls to the top of the page whenever the pathname changes.
// It uses the `useLocation` hook from `react-router-dom` to detect changes in the current route.
// The `useEffect` hook is used to trigger the scroll action whenever the `pathname` changes.
// The `window.scrollTo` method is called with `top: 0` and `behavior: 'smooth'` to ensure a smooth scrolling effect to the top of the page