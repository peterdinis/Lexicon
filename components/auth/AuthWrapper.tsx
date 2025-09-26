"use client";

import { FC, ReactNode } from "react";

type AuthWrapperProps = {
  children: ReactNode;
};

const AuthWrapper: FC<AuthWrapperProps> = ({ children }: AuthWrapperProps) => {
  return (
    <div className="mt-10 flex justify-center items-center">{children}</div>
  );
};

export default AuthWrapper;