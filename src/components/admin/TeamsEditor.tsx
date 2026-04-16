import { useState, useRef, useMemo, ChangeEvent } from 'react';
import { ChampionshipData, Constructor, SeasonId } from '../../types';
import { Plus, Trash2, Edit2, X, Check, Upload } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cn } from '../../lib/utils';
import { dataService } from '../../services/dataService';
import { storageService } from '../../services/storageService';
import { useEditorState } from '../../hooks/useEditorState';

interface TeamsEditorProps {
  data: ChampionshipData;
  onUpdateData: (newData: ChampionshipData) => void;
  activeSeason: SeasonId;
  isHistorical: boolean;
}

export function TeamsEditor({ data, onUpdateData, activeSeason, isHistorical }: TeamsEditorProps) {
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc'>('name_asc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const {
    editingId,
    editForm,
    setEditForm,
    isSaving,
    saveMessage,
    handleCancel: baseHandleCancel,
    startEditing: baseStartEditing,
    startNew: baseStartNew,
    withSave,
  } = useEditorState<Constructor>();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'storage' | 'base64'>('base64');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buttonColor = isHistorical ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700";

  const handleEdit = (team: Constructor) => {
    baseStartEditing(team.id, team);
    setIsUploading(false);
  };

  const handleCancel = () => {
    baseHandleCancel();
    setIsUploading(false);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Warning for large files in Base64 mode
    if (file.size > 100 * 1024 && uploadMode === 'base64') {
        console.warn(`La imagen pesa ${(file.size / 1024).toFixed(0)}KB. Guardarla en Base64 puede ralentizar la carga de datos.`);
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
          try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            
            setEditForm(prev => ({ ...prev, logoUrl: base64 }));
            console.info(`Nota: La subida a Storage falló (${error.message}). Se usó Base64 automáticamente.`);
          } catch (base64Error) {
            console.error("Error converting to base64:", base64Error);
          }
      } else {
          console.error(`Error al procesar imagen: ${error.message}`);
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

    await withSave(async () => {
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
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    await withSave(async () => {
      const updatedTeams = data.constructors.filter(t => t.id !== id);
      const updatedData = { ...data, constructors: updatedTeams };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
    });
  };

  const handleAddNew = () => {
    baseStartNew({ name: '', color: '#FFFFFF', logoUrl: '' });
    setIsUploading(false);
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    await withSave(async () => {
      const updatedTeams = data.constructors.filter(t => !selectedIds.includes(t.id));
      const updatedData = { ...data, constructors: updatedTeams };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    });
  };

  const handleDeleteAll = async () => {
    if (data.constructors.length === 0) return;

    await withSave(async () => {
      const updatedData = { ...data, constructors: [] };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setSelectedIds([]);
      setShowDeleteAllConfirm(false);
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.constructors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.constructors.map(t => t.id));
    }
  };

  const sortedTeams = useMemo(() => [...data.constructors].sort((a, b) => {
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    return a.name.localeCompare(b.name);
  }), [data.constructors, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-white italic uppercase">Gestión de Escuderías</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name_asc' | 'name_desc')}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-slate-500"
            >
              <option value="name_asc">Nombre (A-Z)</option>
              <option value="name_desc">Nombre (Z-A)</option>
            </select>
            
            <div className="h-6 w-px bg-white/10 mx-2" />

            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                  {selectedIds.length} Seleccionados
                </span>
                
                {showBulkDeleteConfirm ? (
                  <div className="flex items-center gap-1 bg-red-600 rounded-lg p-1 animate-in zoom-in-95 duration-200">
                    <span className="text-[9px] font-black text-white uppercase px-2">¿Seguro?</span>
                    <button 
                      onClick={handleBulkDelete}
                      className="p-1 bg-white text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      <Check size={12} />
                    </button>
                    <button 
                      onClick={() => setShowBulkDeleteConfirm(false)}
                      className="p-1 bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded border border-red-500/30 transition-all flex items-center gap-2 text-[10px] font-bold uppercase"
                  >
                    <Trash2 size={12} /> Eliminar
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setSelectedIds([]);
                    setShowBulkDeleteConfirm(false);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-white/10 transition-all text-[10px] font-bold uppercase"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {showDeleteAllConfirm ? (
                  <div className="flex items-center gap-1 bg-red-700 rounded-lg p-1 animate-in zoom-in-95 duration-200 border border-red-500">
                    <span className="text-[9px] font-black text-white uppercase px-2">¿BORRAR TODO?</span>
                    <button 
                      onClick={handleDeleteAll}
                      className="p-1 bg-white text-red-700 rounded hover:bg-red-50 transition-colors"
                    >
                      <Check size={12} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteAllConfirm(false)}
                      className="p-1 bg-red-900 text-white rounded hover:bg-red-800 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    disabled={data.constructors.length === 0 || editingId !== null}
                    className="p-1.5 bg-red-950/30 hover:bg-red-600 text-red-500 hover:text-white rounded border border-red-500/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase disabled:opacity-30"
                  >
                    <Trash2 size={12} /> Borrar Todo
                  </button>
                )}
              </div>
            )}

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
              <th className="p-4 w-10">
                <input 
                  type="checkbox" 
                  checked={data.constructors.length > 0 && selectedIds.length === data.constructors.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-600"
                />
              </th>
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
                <td className="p-4"></td>
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
                            {isUploading ? <LoadingSpinner size="sm" /> : <Upload size={16} />}
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
            {data.constructors.length === 0 && editingId !== 'new' && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                  No hay escuderías registradas en esta temporada.
                </td>
              </tr>
            )}
            {sortedTeams.map(team => (
              <tr key={team.id} className={cn(
                "hover:bg-white/5 transition-colors",
                selectedIds.includes(team.id) && "bg-red-500/5"
              )}>
                {editingId === team.id ? (
                  <>
                    <td className="p-4"></td>
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
                                {isUploading ? <LoadingSpinner size="sm" /> : <Upload size={16} />}
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
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(team.id)}
                        onChange={() => toggleSelect(team.id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-600"
                      />
                    </td>
                    <td className="p-4">
                      <img src={team.logoUrl || undefined} alt={team.name} className="w-10 h-10 rounded object-cover bg-white/10" />
                    </td>
                    <td className="p-4 font-bold text-white">{team.name}</td>
                    <td className="p-4">
                      <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: team.color }}></div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {deletingId === team.id ? (
                          <div className="flex items-center gap-2 bg-red-500/10 p-1 rounded-lg border border-red-500/20">
                            <span className="text-[10px] text-red-400 font-bold uppercase px-2">¿Borrar?</span>
                            <button 
                              onClick={() => handleDelete(team.id)} 
                              className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Confirmar eliminación"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => setDeletingId(null)} 
                              className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                              title="Cancelar"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(team)} disabled={editingId !== null || deletingId !== null} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30" title="Editar">
                              <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => setDeletingId(team.id)} 
                                disabled={editingId !== null || deletingId !== null} 
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-30"
                                title="Eliminar Escudería"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
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
