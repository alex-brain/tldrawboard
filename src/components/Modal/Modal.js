import React from "react";
import "./Modal.css";

const Modal = ({ children, isOpen }) => {
  return (
    <div className={isOpen ? "modal" : "modal close"}>
      <div className="modal__content">{children}</div>
    </div>
  );
};

export default Modal;
