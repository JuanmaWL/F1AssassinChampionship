import { useState, useRef } from 'react';

export function useEditorState<T>() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<T>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setSaveMessage(null);
  };

  const startEditing = (id: string, item: T) => {
    setEditingId(id);
    setEditForm(item);
  };

  const startNew = (defaults: Partial<T> = {}) => {
    setEditingId('new');
    setEditForm(defaults);
  };

  const withSave = async (fn: () => Promise<void>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await fn();
      setSaveMessage('Guardado exitosamente');
      saveTimerRef.current = setTimeout(() => setSaveMessage(null), 3000);
      handleCancel();
    } catch (error) {
      console.error('Error saving:', error);
      setSaveMessage('Error al guardar');
      saveTimerRef.current = setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    editingId,
    editForm,
    setEditForm,
    isSaving,
    saveMessage,
    handleCancel,
    startEditing,
    startNew,
    withSave,
  };
}
