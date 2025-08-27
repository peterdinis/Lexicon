import { CREATE_PAGE } from "@/graphql/mutations/pages/pagesMutations";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";

export const useCreatePage = () => {
  const router = useRouter();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [createPage, { loading: saving }] = useMutation(CREATE_PAGE, {
    onCompleted: (data) => {
      console.log("Page saved:", data.createPage);
      setLastSaved(new Date());
      router.push("/dashboard");
    },
    onError: (err) => {
      console.error("Error saving page:", err);
    },
  });

  return { createPage, saving, lastSaved, setLastSaved };
};