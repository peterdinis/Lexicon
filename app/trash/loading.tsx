import { Spinner } from "@/components/ui/spinner";
import { FC, Suspense } from "react";

const Loading: FC = () => {
  return <Suspense fallback={<Spinner />} />;
};

export default Loading;
