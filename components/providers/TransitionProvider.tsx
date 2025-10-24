"use client";

import { FC, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type TransitionProviderProps = {
  children: ReactNode;
};

const TransitionProvider: FC<TransitionProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(false);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={`
      transition-all duration-300 ease-in-out
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
    `}
    >
      {children}
    </div>
  );
};

export default TransitionProvider;
