import { useState } from 'react';
import { ChampionshipData, Race, SeasonId } from '../../types';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dataService } from '../../services/dataService';
import { useEditorState } from '../../hooks/useEditorState';
import { getFlagUrl } from '../../constants/assets';
import { BulkDeleteBar } from './BulkDeleteBar';

interface CalendarEditorProps {
  data: ChampionshipData;
  onUpdateData: (newData: ChampionshipData) => void;
  activeSeason: SeasonId;
  isHistorical: boolean;
}

export function CalendarEditor({ data, onUpdateData, activeSeason, isHistorical }: CalendarEditorProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const {
    editingId,
    editForm,
    setEditForm,
    isSaving,
    handleCancel,
    startEditing,
    startNew,
    withSave,
  } = useEditorState<Race>();

  const accentColor = isHistorical ? "text-amber-500" : "text-red-500";
  const buttonColor = isHistorical ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700";

  const handleSave = async () => {
    if (!editForm.name || !editForm.circuit || !editForm.date) return;

    await withSave(async () => {
      let updatedRaces = [...data.races];
      
      if (editingId === 'new') {
        const newRace: Race = {
          id: `r${Date.now()}`,
          name: editForm.name,
          circuit: editForm.circuit,
          date: editForm.date,
          flagCode: editForm.flagCode || 'un',
          status: 'pending',
        };
        updatedRaces.push(newRace);
      } else {
        updatedRaces = updatedRaces.map(r => 
          r.id === editingId ? { ...r, ...editForm } as Race : r
        );
      }

      // Sort by date
      updatedRaces.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const updatedData = { ...data, races: updatedRaces };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
    }, {
      successMessage: editingId === 'new' ? 'Carrera creada correctamente' : 'Carrera actualizada correctamente'
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    await withSave(async () => {
      const updatedRaces = data.races.filter(r => r.id !== id);
      const updatedData = { ...data, races: updatedRaces };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
    }, {
      successMessage: 'Carrera eliminada',
      successType: 'info'
    });
  };

  const handleAddNew = () => {
    startNew({ name: '', circuit: '', date: '', flagCode: '' });
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    await withSave(async () => {
      const updatedRaces = data.races.filter(r => !selectedIds.includes(r.id));
      const updatedData = { ...data, races: updatedRaces };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    }, {
      successMessage: 'Carreras eliminadas',
      successType: 'info'
    });
  };

  const handleDeleteAll = async () => {
    if (data.races.length === 0) return;

    await withSave(async () => {
      const updatedData = { ...data, races: [] };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setSelectedIds([]);
      setShowDeleteAllConfirm(false);
    }, {
      successMessage: 'Todas las carreras han sido eliminadas',
      successType: 'info'
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.races.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.races.map(r => r.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white italic uppercase">Gestión del Calendario</h3>
          
          <div className="h-6 w-px bg-white/10 mx-2" />

          <BulkDeleteBar
            selectedCount={selectedIds.length}
            showConfirm={showBulkDeleteConfirm}
            setShowConfirm={setShowBulkDeleteConfirm}
            onConfirmDelete={handleBulkDelete}
            onCancelSelection={() => {
              setSelectedIds([]);
              setShowBulkDeleteConfirm(false);
            }}
          />

          {selectedIds.length === 0 && (
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
                  disabled={data.races.length === 0 || editingId !== null}
                  className="p-1.5 bg-red-950/30 hover:bg-red-600 text-red-500 hover:text-white rounded border border-red-500/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase disabled:opacity-30"
                >
                  <Trash2 size={12} /> Borrar Todo
                </button>
              )}
            </div>
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
          <Plus size={16} /> Nueva Carrera
        </button>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-4 w-10">
                <input 
                  type="checkbox" 
                  checked={data.races.length > 0 && selectedIds.length === data.races.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-600"
                />
              </th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Gran Premio</th>
              <th className="p-4">Circuito</th>
              <th className="p-4">Flag</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {editingId === 'new' && (
              <tr className="bg-slate-800/50">
                <td className="p-4"></td>
                <td className="p-4">
                  <input
                    type="datetime-local"
                    value={editForm.date || ''}
                    onChange={e => setEditForm({...editForm, date: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Nombre GP"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={editForm.circuit || ''}
                    onChange={e => setEditForm({...editForm, circuit: e.target.value})}
                    placeholder="Circuito"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editForm.flagCode || ''}
                      onChange={e => setEditForm({...editForm, flagCode: e.target.value.toLowerCase()})}
                      placeholder="es, gb..."
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm text-center uppercase"
                      maxLength={2}
                    />
                    {editForm.flagCode && (
                      <img 
                        src={getFlagUrl(editForm.flagCode || 'un', '24x18')}
                        alt="Preview"
                        className="w-6 h-4 rounded-sm object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Código ISO (ej: es, mx)</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={handleSave} disabled={isSaving} className="p-2 bg-green-600 rounded text-white hover:bg-green-700">
                      <Check size={16} />
                    </button>
                    <button onClick={handleCancel} className="p-2 bg-slate-600 rounded text-white hover:bg-slate-700">
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {data.races.length === 0 && editingId !== 'new' && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                  No hay carreras registradas en esta temporada.
                </td>
              </tr>
            )}
            {data.races.map(race => (
              <tr key={race.id} className={cn(
                "hover:bg-white/5 transition-colors",
                selectedIds.includes(race.id) && "bg-red-500/5"
              )}>
                {editingId === race.id ? (
                  <>
                    <td className="p-4"></td>
                    <td className="p-4">
                      <input
                        type="datetime-local"
                        value={editForm.date || ''}
                        onChange={e => setEditForm({...editForm, date: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                      />
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
                        type="text"
                        value={editForm.circuit || ''}
                        onChange={e => setEditForm({...editForm, circuit: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editForm.flagCode || ''}
                          onChange={e => setEditForm({...editForm, flagCode: e.target.value.toLowerCase()})}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm text-center uppercase"
                          maxLength={2}
                        />
                        {editForm.flagCode && (
                          <img 
                            src={getFlagUrl(editForm.flagCode || 'un', '24x18')}
                            alt="Preview"
                            className="w-6 h-4 rounded-sm object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={handleSave} disabled={isSaving} className="p-2 bg-green-600 rounded text-white hover:bg-green-700">
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
                        checked={selectedIds.includes(race.id)}
                        onChange={() => toggleSelect(race.id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-600"
                      />
                    </td>
                    <td className="p-4 text-slate-300 text-sm">
                      {race.date ? new Date(race.date).toLocaleDateString() : <span className="text-slate-500 italic">Por definir</span>}
                    </td>
                    <td className="p-4 font-bold text-white">{race.name}</td>
                    <td className="p-4 text-slate-400 text-sm">{race.circuit}</td>
                    <td className="p-4">
                      <img 
                        src={getFlagUrl(race.flagCode, '24x18')} 
                        alt={race.flagCode} 
                        className="inline-block rounded-sm"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {deletingId === race.id ? (
                          <div className="flex items-center gap-2 bg-red-500/10 p-1 rounded-lg border border-red-500/20">
                            <span className="text-[10px] text-red-400 font-bold uppercase px-2">¿Borrar?</span>
                            <button 
                              onClick={() => handleDelete(race.id)} 
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
                            <button onClick={() => startEditing(race.id, race)} disabled={editingId !== null || deletingId !== null} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => setDeletingId(race.id)} disabled={editingId !== null || deletingId !== null} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-30">
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
