import { create } from "zustand";

type ModalType =
  | "search"
  | "workspace"
  | "settings"
  | "trash"
  | "upload"
  | "template";

type ModalState = {
  openModal: ModalType | null;
  setOpenModal: (modal: ModalType | null) => void;
  isOpen: (modal: ModalType) => boolean;
};

export const useModalStore = create<ModalState>((set, get) => ({
  openModal: null,
  setOpenModal: (modal) => set({ openModal: modal }),
  isOpen: (modal) => get().openModal === modal,
}));
