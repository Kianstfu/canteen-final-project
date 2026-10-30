import { useLayoutEffect } from 'react';

// Ang orihinal na bawat HTML page ay may sariling <body> styles at <title>.
// Sa React, iisa ang <body>, kaya ang class ng page (hal. "pg-menu") ay
// idinadagdag sa <body> habang naka-mount ang page, at tinatanggal pagkatapos.
export default function usePage(pageClass, title, extraBodyClasses = '') {
  useLayoutEffect(() => {
    const classes = [pageClass, ...extraBodyClasses.split(' ').filter(Boolean)];
    document.body.classList.add(...classes);
    document.title = title;
    return () => document.body.classList.remove(...classes);
  }, [pageClass, title, extraBodyClasses]);
}
