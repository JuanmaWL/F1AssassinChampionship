import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export function useEditorState<T>() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<T>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const startEditing = (id: string, item: T) => {
    setEditingId(id);
    setEditForm(item);
  };

  const startNew = (defaults: Partial<T> = {}) => {
    setEditingId('new');
    setEditForm(defaults);
  };

  const withSave = async (
    fn: () => Promise<void>, 
    options?: { successMessage?: string, successType?: 'success' | 'info' | 'error', errorMessage?: string, keepOpen?: boolean }
  ) => {
    setIsSaving(true);
    try {
      await fn();
      addToast(options?.successMessage || 'Guardado exitosamente', options?.successType || 'success');
      if (!options?.keepOpen) {
        handleCancel();
      }
    } catch (error) {
      console.error('Error saving:', error);
      addToast(options?.errorMessage || 'Error al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    editingId,
    editForm,
    setEditForm,
    isSaving,
    handleCancel,
    startEditing,
    startNew,
    withSave,
  };
}
