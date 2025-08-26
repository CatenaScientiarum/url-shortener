// src/components/Modal/Modal.jsx
import React from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";

export default function Modal({ children, onClose }) {
  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // чтобы клик внутри модалки не закрывал её
      >
        {children}
      </div>
    </div>,
    document.body // рендерим прямо в body
  );
}
