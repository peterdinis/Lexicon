"use client"

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { FC } from "react";

const Editor: FC = () => {
  // Creates a new editor instance.
  const editor = useCreateBlockNote();
  // Renders the editor instance using a React component.
  return (
    <BlockNoteView
      editor={editor}
      shadCNComponents={
        {
          // Pass modified ShadCN components from your project here.
          // Otherwise, the default ShadCN components will be used.
        }
      }
    />
  );
}

export default Editor
