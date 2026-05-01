import React from 'react';
import { Trash2, Check, X } from 'lucide-react';

interface BulkDeleteBarProps {
  selectedCount: number;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  onConfirmDelete: () => void;
  onCancelSelection: () => void;
}

export const BulkDeleteBar: React.FC<BulkDeleteBarProps> = ({
  selectedCount,
  showConfirm,
  setShowConfirm,
  onConfirmDelete,
  onCancelSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
        {selectedCount} Seleccionados
      </span>
      
      {showConfirm ? (
        <div className="flex items-center gap-1 bg-red-600 rounded-lg p-1 animate-in zoom-in-95 duration-200">
          <span className="text-[9px] font-black text-white uppercase px-2">¿Seguro?</span>
          <button 
            onClick={onConfirmDelete}
            className="p-1 bg-white text-red-600 rounded hover:bg-red-50 transition-colors"
          >
            <Check size={12} />
          </button>
          <button 
            onClick={() => setShowConfirm(false)}
            className="p-1 bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded border border-red-500/30 transition-all flex items-center gap-2 text-[10px] font-bold uppercase"
        >
          <Trash2 size={12} /> Eliminar
        </button>
      )}
      
      <button
        onClick={onCancelSelection}
        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-white/10 transition-all text-[10px] font-bold uppercase"
      >
        Cancelar
      </button>
    </div>
  );
};
