import React from 'react';

function Modal({ isOpen, onClose, title, children, onConfirm, confirmText = "Confirmar", cancelText = "Cancelar", showConfirm = true, showCancel = true }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          {showCancel && (
             <button
                 onClick={onClose}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
                 aria-label="Fechar modal"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
             </button>
          )}
        </div>

        <div className="text-gray-700 mb-6">
          {children}
        </div>

        {(showConfirm || showCancel) && (
         <div className="flex justify-end space-x-4">
             {showCancel && (
             <button
                 onClick={onClose}
                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
             >
                 {cancelText}
             </button>
             )}
             {showConfirm && onConfirm && (
             <button
                 onClick={onConfirm}
                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors" // Estilo para confirmação de exclusão
             >
                 {confirmText}
             </button>
             )}
         </div>
        )}
      </div>
    </div>
  );
}

export default Modal;