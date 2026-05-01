import { useState, useMemo, useRef, useEffect } from 'react';
import { ChampionshipData, Driver, SeasonId, Constructor } from '../../types';
import { Plus, Trash2, Edit2, X, Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dataService } from '../../services/dataService';
import { useEditorState } from '../../hooks/useEditorState';
import { BulkDeleteBar } from './BulkDeleteBar';

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
  const [sortBy, setSortBy] = useState<'name' | 'team'>('name');
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
  } = useEditorState<Driver>();

  const buttonColor = isHistorical ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700";

  // Sort drivers — memoized to avoid re-sorting on every render
  const sortedDrivers = useMemo(() => [...data.drivers].sort((a, b) => {
    if (sortBy === 'team') {
      const teamCompare = a.team.localeCompare(b.team);
      return teamCompare !== 0 ? teamCompare : a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  }), [data.drivers, sortBy]);

  const handleSave = async () => {
    if (!editForm.name || !editForm.team) return;

    await withSave(async () => {
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
        if (editForm.avatarUrl && editForm.avatarUrl.trim() !== '') {
          newDriver.avatarUrl = editForm.avatarUrl.trim();
        }
        updatedDrivers.push(newDriver);
      } else {
        updatedDrivers = updatedDrivers.map(d => {
          if (d.id === editingId) {
            const updated = { ...d, ...editForm } as Driver;
            if (!updated.avatarUrl || updated.avatarUrl.trim() === '') {
              delete updated.avatarUrl;
            } else {
              updated.avatarUrl = updated.avatarUrl.trim();
            }
            return updated;
          }
          return d;
        });
      }

      const updatedData = { ...data, drivers: updatedDrivers };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
    }, {
      successMessage: editingId === 'new' ? 'Piloto creado correctamente' : 'Piloto actualizado correctamente'
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    await withSave(async () => {
      const updatedDrivers = data.drivers.filter(d => d.id !== id);
      const updatedData = { ...data, drivers: updatedDrivers };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
    }, {
      successMessage: 'Piloto eliminado',
      successType: 'info'
    });
  };

  const handleAddNew = () => {
    startNew({ name: '', team: '', teamColor: '#FFFFFF' });
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    await withSave(async () => {
      const updatedDrivers = data.drivers.filter(d => !selectedIds.includes(d.id));
      const updatedData = { ...data, drivers: updatedDrivers };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    }, {
      successMessage: 'Pilotos eliminados',
      successType: 'info'
    });
  };

  const handleDeleteAll = async () => {
    if (data.drivers.length === 0) return;

    await withSave(async () => {
      const updatedData = { ...data, drivers: [] };
      await dataService.saveData(updatedData, activeSeason);
      onUpdateData(updatedData);
      setSelectedIds([]);
      setShowDeleteAllConfirm(false);
    }, {
      successMessage: 'Todos los pilotos han sido eliminados',
      successType: 'info'
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.drivers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.drivers.map(d => d.id));
    }
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
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white italic uppercase">Gestión de Pilotos</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'team')}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-slate-500"
          >
            <option value="name">Ordenar por Piloto</option>
            <option value="team">Ordenar por Escudería</option>
          </select>

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
                  disabled={data.drivers.length === 0 || editingId !== null}
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
          <Plus size={16} /> Nuevo Piloto
        </button>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-4 w-10">
                <input 
                  type="checkbox" 
                  checked={data.drivers.length > 0 && selectedIds.length === data.drivers.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-600"
                />
              </th>
              <th className="p-4">Nombre</th>
              <th className="p-4 w-1/3">Escudería</th>
              <th className="p-4">Color</th>
              <th className="p-4 w-1/4">Avatar</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {editingId === 'new' && (
              <tr className="bg-slate-800/50">
                <td className="p-4"></td>
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
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editForm.avatarUrl || ''}
                        onChange={e => setEditForm({...editForm, avatarUrl: e.target.value})}
                        placeholder="URL Foto (opcional)"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <img
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(editForm.id || 'preview')}&backgroundColor=transparent&style=circle`}
                        alt="Preview"
                        className="w-10 h-10 rounded-full bg-slate-800"
                      />
                      <span className="text-[9px] text-slate-500 mt-1 max-w-[60px] text-center leading-tight">Avatar por defecto (si no hay foto)</span>
                    </div>
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
              </tr>
            )}
            {data.drivers.length === 0 && editingId !== 'new' && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                  No hay pilotos registrados en esta temporada.
                </td>
              </tr>
            )}
            {sortedDrivers.map(driver => (
              <tr key={driver.id} className={cn(
                "hover:bg-white/5 transition-colors",
                selectedIds.includes(driver.id) && "bg-red-500/5"
              )}>
                {editingId === driver.id ? (
                  <>
                    <td className="p-4"></td>
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
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editForm.avatarUrl || ''}
                            onChange={e => setEditForm({...editForm, avatarUrl: e.target.value})}
                            placeholder="URL Foto (opcional)"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div className="flex flex-col items-center shrink-0">
                          <img
                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(editForm.id || 'preview')}&backgroundColor=transparent&style=circle`}
                            alt="Preview"
                            className="w-10 h-10 rounded-full bg-slate-800"
                          />
                          <span className="text-[9px] text-slate-500 mt-1 max-w-[60px] text-center leading-tight">Avatar por defecto (si no hay foto)</span>
                        </div>
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
                        checked={selectedIds.includes(driver.id)}
                        onChange={() => toggleSelect(driver.id)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-600"
                      />
                    </td>
                    <td className="p-4 font-bold text-white">{driver.name}</td>
                    <td className="p-4 text-slate-300">{driver.team}</td>
                    <td className="p-4">
                      <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: driver.teamColor }}></div>
                    </td>
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 overflow-hidden" style={{ borderColor: driver.teamColor }}>
                        <img
                          src={driver.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(driver.id)}&backgroundColor=slate800`}
                          alt={driver.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(driver.id)}&backgroundColor=slate800`; }}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {deletingId === driver.id ? (
                          <div className="flex items-center gap-2 bg-red-500/10 p-1 rounded-lg border border-red-500/20">
                            <span className="text-[10px] text-red-400 font-bold uppercase px-2">¿Borrar?</span>
                            <button 
                              onClick={() => handleDelete(driver.id)} 
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
                            <button onClick={() => startEditing(driver.id, driver)} disabled={editingId !== null || deletingId !== null} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-30">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => setDeletingId(driver.id)} disabled={editingId !== null || deletingId !== null} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-30">
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