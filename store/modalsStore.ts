import { create } from "zustand";

type ModalType =
  | "search"
  | "workspace"
  | "settings"
  | "trash"
  | "upload"
  | "template"
  | "templateDetail";

type ModalState = {
  openModal: ModalType | null;
  templateDetailId: string | null
  setOpenModal: (modal: ModalType | null, templateDetailId?: string | null) => void;
  isOpen: (modal: ModalType) => boolean;
};

export const useModalStore = create<ModalState>((set, get) => ({
  openModal: null,
  templateDetailId: null,
  setOpenModal: (modal, templateDetailId = null) =>
    set({ openModal: modal, templateDetailId }),
  isOpen: (modal) => get().openModal === modal,
}));
