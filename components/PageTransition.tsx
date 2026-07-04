"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);
  const [isNavigating, setIsNavigating] = useState(false);
  const prevPath = useRef(pathname);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      setIsNavigating(true);
      setProgress(20);

      const t1 = setTimeout(() => setProgress(65), 100);
      const t2 = setTimeout(() => setProgress(85), 300);
      const t3 = setTimeout(() => {
        setProgress(100);
        setKey(pathname);
        prevPath.current = pathname;
        setTimeout(() => {
          setIsNavigating(false);
          setProgress(0);
        }, 200);
      }, 450);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [pathname]);

  return (
    <>
      {/* Top progress bar */}
      {isNavigating && (
        <div
          className="nav-progress"
          style={{ width: `${progress}%`, transition: "width 0.3s ease" }}
        />
      )}

      {/* Animated page wrapper */}
      <div key={key} className="page-transition">
        {children}
      </div>
    </>
  );
}
