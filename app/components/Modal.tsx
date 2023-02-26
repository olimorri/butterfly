import type { ReactNode } from "react";
import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ModalProps = {
  children: ReactNode;
  handleClose: () => void;
  size: "small" | "large";
};

export default function Modal({ children, handleClose, size }: ModalProps) {
  useEffect(() => {
    const close = (e: any) => {
      if (e.keyCode === 27) {
        handleClose();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [handleClose]);

  if (size === "small") {
    return (
      <div className="absolute top-0 left-0 z-0 m-auto flex h-screen w-screen flex-col items-center justify-center bg-black/20">
        <div className=" fixed flex h-1/2 w-2/5  flex-col overflow-hidden rounded-xl shadow-lg">
          <div className="flex h-8 w-full flex-row items-center justify-end border-b bg-white py-3">
            <button
              onClick={handleClose}
              className="w-20 rounded-lg rounded-b-none p-2 hover:bg-red-100"
            >
              <XMarkIcon className="inline-block h-4 w-4 " />
            </button>
          </div>
          <div className=" h-full w-full bg-neutral-50">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 z-0 m-0 box-border flex h-screen w-screen flex-col items-center justify-center bg-black/20">
      <div
        className=" fixed box-border w-4/5 overflow-clip rounded-xl border shadow-lg"
        style={{ height: "80%" }}
      >
        <div className="flex h-full flex-col bg-neutral-50">
          <ModalToolbar handleClose={handleClose} />
          <div
            className="box-border overflow-visible bg-neutral-50"
            style={{ height: "96%" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const ModalToolbar = ({ handleClose }: { handleClose: () => void }) => {
  return (
    <div className="rounded-t-lg" style={{ height: "4%" }}>
      <div className="flex w-full flex-row items-center justify-end">
        <button onClick={handleClose} className="w-20 hover:bg-red-100">
          <XMarkIcon className="inline-block h-full w-4" />
        </button>
      </div>
    </div>
  );
};
