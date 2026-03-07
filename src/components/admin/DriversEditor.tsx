import React, { useState, useRef, useEffect } from 'react';
import { ChampionshipData, Driver, SeasonId, Constructor } from '../../types';
import { Save, Plus, Trash2, Edit2, X, Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dataService } from '../../services/dataService';

interface DriversEditorProps {
  data: ChampionshipData;
  onUpdateData: (newData: ChampionshipData) => void;
  activeSeason: SeasonId;
  isHistorical: boolean;
}

interface TeamSelectProps {
  teams: Constructor[];
  value: string;
  onChange: (teamName: string) => void;
}

function TeamSelect({ teams, value, onChange }: TeamSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
  const selectedTeam = teams.find(t => t.name === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedTeam ? (
            <>
              {selectedTeam.logoUrl && (
                <img 
                  src={selectedTeam.logoUrl} 
                  alt="" 
                  className="w-5 h-5 object-contain rounded bg-white/10" 
                />
              )}
              <span className="truncate">{selectedTeam.name}</span>
            </>
          ) : (
            <span className="text-slate-500">Seleccionar Escudería...</span>
          )}
        </div>
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {sortedTeams.map(team => (
            <button
              key={team.id}
              type="button"
              onClick={() => {
                onChange(team.name);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-sm text-white hover:bg-slate-800 flex items-center gap-3 transition-colors text-left"
            >
              {team.logoUrl ? (
                <img 
                  src={team.logoUrl} 
                  alt="" 
                  className="w-6 h-6 object-contain rounded bg-white/10" 
                />
              ) : (
                <div className="w-6 h-6 rounded bg-white/10" />
              )}
              <span>{team.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DriversEditor({ data, onUpdateData, activeSeason, isHistorical }: DriversEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Driver>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const accentColor = isHistorical ? "text-amber-500" : "text-red-500";
  const buttonColor = isHistorical ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700";

  // Sort drivers alphabetically by name
  const sortedDrivers = [...data.drivers].sort((a, b) => a.name.localeCompare(b.name));

  const handleEdit = (driver: Driver) => {
    setEditingId(driver.id);
    setEditForm(driver);
    setSaveMessage(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.team) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
      let updatedDrivers = [...data.drivers];
      
      if (editingId === 'new') {
        const newDriver: Driver = {
          id: `d${Date.now()}`,
          name: editForm.name,
          team: editForm.team,
          teamColor: editForm.teamColor || '#FFFFFF',
          points: 0,
          fastestLaps: 0
        };
        updatedDrivers.push(newDriver);
      } else {
        updatedDrivers = updatedDrivers.map(d => 
          d.id === editingId ? { ...d, ...editForm } as Driver : d
        );
      }

      const updatedData = { ...data, drivers: updatedDrivers };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setEditingId(null);
      setEditForm({});
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving driver:", error);
      setSaveMessage("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este piloto permanentemente? Esta acción no se puede deshacer.")) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updatedDrivers = data.drivers.filter(d => d.id !== id);
      const updatedData = { ...data, drivers: updatedDrivers };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setSaveMessage("Piloto eliminado");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting driver:", error);
      setSaveMessage("Error al eliminar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNew = () => {
    setEditingId('new');
    setEditForm({ name: '', team: '', teamColor: '#FFFFFF' });
    setSaveMessage(null);
  };

  const handleTeamChange = (teamName: string) => {
    const selectedTeam = data.constructors.find(c => c.name === teamName);
    setEditForm(prev => ({
        ...prev,
        team: teamName,
        teamColor: selectedTeam ? selectedTeam.color : prev.teamColor
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white italic uppercase">Gestión de Pilotos</h3>
        <button
          onClick={handleAddNew}
          disabled={editingId !== null}
          className={cn(
            "px-4 py-2 rounded-lg text-white font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50",
            buttonColor
          )}
        >
          <Plus size={16} /> Nuevo Piloto
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

      <div className="bg-slate-900/50 border border-white/5 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4 w-1/3">Escudería</th>
              <th className="p-4">Color</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {editingId === 'new' && (
              <tr className="bg-slate-800/50">
                <td className="p-4">
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Nombre del Piloto"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                  />
                </td>
                <td className="p-4">
                  <TeamSelect 
                    teams={data.constructors}
                    value={editForm.team || ''}
                    onChange={handleTeamChange}
                  />
                </td>
                <td className="p-4">
                  <input
                    type="color"
                    value={editForm.teamColor || '#FFFFFF'}
                    onChange={e => setEditForm({...editForm, teamColor: e.target.value})}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent"
                  />
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
            {sortedDrivers.map(driver => (
              <tr key={driver.id} className="hover:bg-white/5 transition-colors">
                {editingId === driver.id ? (
                  <>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                      />
                    </td>
                    <td className="p-4">
                      <TeamSelect 
                        teams={data.constructors}
                        value={editForm.team || ''}
                        onChange={handleTeamChange}
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="color"
                        value={editForm.teamColor || '#FFFFFF'}
                        onChange={e => setEditForm({...editForm, teamColor: e.target.value})}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent"
                      />
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
                    <td className="p-4 font-bold text-white">{driver.name}</td>
                    <td className="p-4 text-slate-300">{driver.team}</td>
                    <td className="p-4">
                      <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: driver.teamColor }}></div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(driver)} disabled={editingId !== null} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(driver.id)} disabled={editingId !== null} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-30">
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
