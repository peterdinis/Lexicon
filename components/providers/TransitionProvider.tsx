"use client";

import {
  FC,
  ReactNode,
  unstable_ViewTransition as ViewTransition,
} from "react";

type TransitionProviderProps = {
  children?: ReactNode;
};

const TransitionProvider: FC<TransitionProviderProps> = ({ children }) => {
  return <ViewTransition enter={"slide-in"}>{children}</ViewTransition>;
};

export default TransitionProvider;
