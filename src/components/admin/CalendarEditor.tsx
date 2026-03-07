import React, { useState } from 'react';
import { ChampionshipData, Race, SeasonId } from '../../types';
import { Save, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dataService } from '../../services/dataService';

interface CalendarEditorProps {
  data: ChampionshipData;
  onUpdateData: (newData: ChampionshipData) => void;
  activeSeason: SeasonId;
  isHistorical: boolean;
}

export function CalendarEditor({ data, onUpdateData, activeSeason, isHistorical }: CalendarEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Race>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const accentColor = isHistorical ? "text-amber-500" : "text-red-500";
  const buttonColor = isHistorical ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700";

  const handleEdit = (race: Race) => {
    setEditingId(race.id);
    setEditForm(race);
    setSaveMessage(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.circuit || !editForm.date) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
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
      setEditingId(null);
      setEditForm({});
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving race:", error);
      setSaveMessage("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta carrera permanentemente? Esta acción no se puede deshacer.")) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updatedRaces = data.races.filter(r => r.id !== id);
      const updatedData = { ...data, races: updatedRaces };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setSaveMessage("Carrera eliminada");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting race:", error);
      setSaveMessage("Error al eliminar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNew = () => {
    setEditingId('new');
    setEditForm({ name: '', circuit: '', date: '', flagCode: '' });
    setSaveMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white italic uppercase">Gestión del Calendario</h3>
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

      {saveMessage && (
        <div className={cn(
            "p-4 rounded-lg border flex items-center gap-2 animate-in fade-in slide-in-from-top-2",
            saveMessage.includes("Error") 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-green-500/10 border-green-500/20 text-green-400"
        )}>
            {saveMessage.includes("Error") ? <X size={18} /> : <Check size={18} />}
            <span className="font-mono text-sm uppercase tracking-wider font-bold">{saveMessage}</span>
        </div>
      )}

      <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
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
                        src={`https://flagcdn.com/24x18/${editForm.flagCode}.png`}
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
            {data.races.map(race => (
              <tr key={race.id} className="hover:bg-white/5 transition-colors">
                {editingId === race.id ? (
                  <>
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
                            src={`https://flagcdn.com/24x18/${editForm.flagCode}.png`}
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
                    <td className="p-4 text-slate-300 text-sm">
                      {new Date(race.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-white">{race.name}</td>
                    <td className="p-4 text-slate-400 text-sm">{race.circuit}</td>
                    <td className="p-4">
                      <img 
                        src={`https://flagcdn.com/24x18/${race.flagCode}.png`} 
                        alt={race.flagCode} 
                        className="inline-block rounded-sm"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(race)} disabled={editingId !== null} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(race.id)} disabled={editingId !== null} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-30">
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
