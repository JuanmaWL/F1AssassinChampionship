import React, { useState, useRef } from 'react';
import { ChampionshipData, Constructor, SeasonId } from '../../types';
import { Save, Plus, Trash2, Edit2, X, Check, Upload, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dataService } from '../../services/dataService';
import { storageService } from '../../services/storageService';

interface TeamsEditorProps {
  data: ChampionshipData;
  onUpdateData: (newData: ChampionshipData) => void;
  activeSeason: SeasonId;
  isHistorical: boolean;
}

export function TeamsEditor({ data, onUpdateData, activeSeason, isHistorical }: TeamsEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Constructor>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'storage' | 'base64'>('base64');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accentColor = isHistorical ? "text-amber-500" : "text-red-500";
  const buttonColor = isHistorical ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700";

  const handleEdit = (team: Constructor) => {
    setEditingId(team.id);
    setEditForm(team);
    setSaveMessage(null);
    setIsUploading(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setSaveMessage(null);
    setIsUploading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Warning for large files in Base64 mode
    if (file.size > 100 * 1024 && uploadMode === 'base64') {
        if (!confirm(`La imagen pesa ${(file.size / 1024).toFixed(0)}KB. Guardarla en Base64 puede ralentizar la carga de datos. ¿Deseas continuar?`)) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
    }

    setIsUploading(true);
    try {
      if (uploadMode === 'storage') {
          // Use a consistent path structure: teams/{season}/{timestamp}_{filename}
          const path = `teams/${activeSeason}/${Date.now()}_${file.name}`;
          const url = await storageService.uploadFile(file, path);
          setEditForm(prev => ({ ...prev, logoUrl: url }));
      } else {
          // Explicit Base64 Mode
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        setEditForm(prev => ({ ...prev, logoUrl: base64 }));
      }
    } catch (error: any) {
      console.error("Error uploading image to Storage:", error);
      
      // Fallback to Base64 if storage fails (CORS issues, network, etc.)
      if (uploadMode === 'storage') {
          console.log("Intentando fallback automático a Base64...");
          try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            
            setEditForm(prev => ({ ...prev, logoUrl: base64 }));
            alert(`Nota: La subida a Storage falló (${error.message}). Se usó Base64 automáticamente.`);
          } catch (base64Error) {
            console.error("Error converting to base64:", base64Error);
            alert(`Error crítico: No se pudo procesar la imagen.`);
          }
      } else {
          alert(`Error al procesar imagen: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.color) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
      let updatedTeams = [...data.constructors];
      
      if (editingId === 'new') {
        const newTeam: Constructor = {
          id: `c${Date.now()}`,
          name: editForm.name!,
          color: editForm.color!,
          logoUrl: editForm.logoUrl || 'https://picsum.photos/200',
          points: 0
        };
        updatedTeams.push(newTeam);
      } else {
        updatedTeams = updatedTeams.map(t => 
          t.id === editingId ? { ...t, ...editForm } as Constructor : t
        );
      }

      const updatedData = { ...data, constructors: updatedTeams };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      
      setEditingId(null);
      setEditForm({});
      setSaveMessage(`Guardado correctamente en Temporada ${activeSeason}`);
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);

    } catch (error) {
      console.error("Error saving team:", error);
      alert("Error al guardar en Firebase. Revisa la consola.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta escudería permanentemente?")) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updatedTeams = data.constructors.filter(t => t.id !== id);
      const updatedData = { ...data, constructors: updatedTeams };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setSaveMessage(`Escudería eliminada de Temporada ${activeSeason}`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting team:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNew = () => {
    setEditingId('new');
    setEditForm({ name: '', color: '#FFFFFF', logoUrl: '' });
    setSaveMessage(null);
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-white italic uppercase">Gestión de Escuderías</h3>
            {saveMessage && (
                <span className="text-green-400 text-sm font-bold animate-pulse flex items-center gap-2">
                    <Check size={14} /> {saveMessage}
                </span>
            )}
        </div>
        <button
          onClick={handleAddNew}
          disabled={editingId !== null}
          className={cn(
            "px-4 py-2 rounded-lg text-white font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50",
            buttonColor
          )}
        >
          <Plus size={16} /> Nueva Escudería
        </button>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-4">
                  <div className="flex items-center gap-2">
                      Logo
                      <div className="flex bg-slate-800 rounded-lg p-0.5 border border-white/10">
                          <button
                              onClick={() => setUploadMode('storage')}
                              className={cn(
                                  "px-2 py-0.5 text-[10px] rounded font-bold uppercase transition-colors",
                                  uploadMode === 'storage' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                              )}
                              title="Subir a Firebase Storage (Recomendado)"
                          >
                              Cloud
                          </button>
                          <button
                              onClick={() => setUploadMode('base64')}
                              className={cn(
                                  "px-2 py-0.5 text-[10px] rounded font-bold uppercase transition-colors",
                                  uploadMode === 'base64' ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                              )}
                              title="Guardar como texto en DB (Solo imágenes pequeñas)"
                          >
                              Base64
                          </button>
                      </div>
                  </div>
              </th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Color</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {editingId === 'new' && (
              <tr className="bg-slate-800/50">
                <td className="p-4 w-1/4">
                  <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                            type="text"
                            value={editForm.logoUrl || ''}
                            onChange={e => setEditForm({...editForm, logoUrl: e.target.value})}
                            placeholder="URL del Logo"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                        />
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
                            title="Subir imagen"
                        >
                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        </button>
                      </div>
                      {editForm.logoUrl && (
                          <img src={editForm.logoUrl} alt="Preview" className="h-8 w-auto object-contain rounded bg-white/5" />
                      )}
                  </div>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Nombre de Escudería"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="color"
                    value={editForm.color || '#FFFFFF'}
                    onChange={e => setEditForm({...editForm, color: e.target.value})}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent"
                  />
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={handleSave} disabled={isSaving || isUploading} className="p-2 bg-green-600 rounded text-white hover:bg-green-700">
                      <Check size={16} />
                    </button>
                    <button onClick={handleCancel} className="p-2 bg-slate-600 rounded text-white hover:bg-slate-700">
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {data.constructors.map(team => (
              <tr key={team.id} className="hover:bg-white/5 transition-colors">
                {editingId === team.id ? (
                  <>
                    <td className="p-4 w-1/4">
                      <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                                type="text"
                                value={editForm.logoUrl || ''}
                                onChange={e => setEditForm({...editForm, logoUrl: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                            />
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
                                title="Subir imagen"
                            >
                                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            </button>
                          </div>
                          {editForm.logoUrl && (
                              <img src={editForm.logoUrl} alt="Preview" className="h-8 w-auto object-contain rounded bg-white/5" />
                          )}
                      </div>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="color"
                        value={editForm.color || '#FFFFFF'}
                        onChange={e => setEditForm({...editForm, color: e.target.value})}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={handleSave} disabled={isSaving || isUploading} className="p-2 bg-green-600 rounded text-white hover:bg-green-700">
                          <Check size={16} />
                        </button>
                        <button onClick={handleCancel} className="p-2 bg-slate-600 rounded text-white hover:bg-slate-700">
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4">
                      <img src={team.logoUrl || undefined} alt={team.name} className="w-10 h-10 rounded object-cover bg-white/10" />
                    </td>
                    <td className="p-4 font-bold text-white">{team.name}</td>
                    <td className="p-4">
                      <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: team.color }}></div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(team)} disabled={editingId !== null} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(team.id)} 
                            disabled={editingId !== null} 
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-30"
                            title="Eliminar Escudería"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
