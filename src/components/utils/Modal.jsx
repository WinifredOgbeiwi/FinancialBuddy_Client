import React from "react";
import { FaTimes } from "react-icons/fa";
import ModalReact from "react-modal";
const Modal = ({ isOpen, isClose, children, title }) => {
  ModalReact.setAppElement("#root");

  return (
    <ModalReact
      isOpen={isOpen}
      appElement={document.getElementById("root")}
      className="p-0 absolute inset-10 w-1/2 m-auto border-2 border-main bg-white outline-none overflow-auto rounded-main"
    >
      <div className="flex items-center gap-3 justify-between bg-secondary2 p-3">
        <h3 className="text-main font-semibold text-xl">{title}</h3>
        <FaTimes
          onClick={() => isClose(false)}
          className="  text-xl cursor-pointer hover"
        />
      </div>
      <div className="mt-5">{children}</div>
    </ModalReact>
  );
};

export default Modal;
