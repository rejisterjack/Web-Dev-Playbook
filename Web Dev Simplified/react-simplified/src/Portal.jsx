import { createPortal } from "react-dom"

export const AlertMessage = ({ children, onClose, isOpen }) => {
  if (!isOpen) return null
  return createPortal(
    <div className="alert alert-primary text-center" onClick={onClose} style={{
      position: "fixed",
      top: "5%",
      left: "50%",
      transform: "translate(-50%, 0%)",
      width: "300px",
      padding: "20px",
      backgroundColor: "lightblue",
      borderRadius: "10px",
      cursor: "pointer"
    }}>
      {children}
    </div>,
    document.getElementById("portal")
  )
}
