"use client";

import { FC } from "react";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { AnimatePresence, motion } from "framer-motion";

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EmojiPicker: FC<EmojiPickerProps> = ({
  selectedEmoji,
  onSelect,
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute top-full left-0 mt-2 z-50"
        >
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onSelect(emoji.native);
              onClose();
            }}
            theme="light"
            emojiSize={20}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
