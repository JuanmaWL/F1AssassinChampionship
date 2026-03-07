import React, { useState, useRef } from 'react';
import { ChampionshipData, RaceResult, SeasonId } from '../../types';
import { Upload, Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../../lib/utils';
import { calculateStandings } from '../../lib/calculations';
import { dataService } from '../../services/dataService';

interface ResultsEditorProps {
  data: ChampionshipData;
  onUpdateData: (newData: ChampionshipData) => void;
  activeSeason: SeasonId;
  isHistorical: boolean;
}

export function ResultsEditor({ data, onUpdateData, activeSeason, isHistorical }: ResultsEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsedResults, setParsedResults] = useState<RaceResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accentColor = isHistorical ? "text-amber-500" : "text-red-500";
  const borderColor = isHistorical ? "border-amber-500/30" : "border-red-500/30";
  const ringColor = isHistorical ? "focus:ring-amber-500" : "focus:ring-red-500";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setParsedResults(null);
    setError(null);
    setSuccess(null);

    try {
      setIsProcessing(true);
      await parseResultsWithAI(file);
    } catch (err) {
      console.error(err);
      setError('Error al procesar la imagen. Por favor intenta de nuevo o ingresa manualmente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseResultsWithAI = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });

      const base64Data = await base64Promise;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing Gemini API Key");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const driversList = data.drivers.map(d => d.name).join(', ');
      const prompt = `
        Analiza esta imagen de resultados de carrera de F1.
        Extrae los resultados en un array JSON.
        Para cada fila necesito:
        - "driverName": El nombre del piloto (string)
        - "position": La posición final (number)
        - "points": Los puntos ganados (number)
        - "fastestLap": true si obtuvo vuelta rápida, false si no (boolean)
        - "raceTime": El tiempo total de carrera o el gap (string, ej: "1:32:45.123" o "+12.456s")
        - "fastestLapTime": El tiempo de la vuelta rápida si aparece (string, ej: "1:18.456")
        - "pitStops": El número de paradas en boxes (number, por defecto 0 si no aparece)
        
        Extrae las posiciones de la imagen haciendo coincidir los nombres que leas con esta lista exacta de nicks: ${driversList}. Usa fuzzy matching si están un poco borrosos.
        
        Devuelve SOLO el array JSON, sin formato markdown.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                { 
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data
                    }
                }
            ]
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const rawResults = JSON.parse(cleanJson);

      const mappedResults: RaceResult[] = rawResults.map((r: any) => {
        const driver = data.drivers.find(d => d.name.toLowerCase().includes(r.driverName.toLowerCase().split(' ').pop()));
        return {
          driverId: driver ? driver.id : 'unknown',
          position: r.position,
          points: r.points,
          fastestLap: r.fastestLap || false,
          dnf: false,
          raceTime: r.raceTime || '-',
          fastestLapTime: r.fastestLapTime || '-',
          pitStops: r.pitStops || 0
        };
      });

      setParsedResults(mappedResults);
      setSuccess("¡IA procesó los resultados con éxito! Por favor revisa abajo.");

    } catch (err) {
      console.error("AI Parsing Error:", err);
      setError("Fallo en IA (Verifica API Key). Cargando datos de prueba.");
      
      setTimeout(() => {
         const mockParsed: RaceResult[] = data.drivers.map((d, i) => ({
            driverId: d.id,
            position: i + 1,
            points: i === 0 ? 25 : i === 1 ? 18 : i === 2 ? 15 : 0,
            fastestLap: i === 0,
            dnf: false,
            raceTime: i === 0 ? "1:30:00.000" : `+${i * 2}.000s`,
            fastestLapTime: "1:18.500",
            pitStops: Math.floor(Math.random() * 3) + 1
         })).slice(0, 10);
         setParsedResults(mockParsed);
         setError(null);
         setSuccess("Datos de prueba cargados (Modo Demo)");
      }, 1000);
    }
  };

  const handleResultChange = (index: number, field: keyof RaceResult, value: any) => {
    if (!parsedResults) return;
    const newResults = [...parsedResults];
    newResults[index] = { ...newResults[index], [field]: value };
    setParsedResults(newResults);
  };

  const handleRaceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raceId = e.target.value;
    setSelectedRaceId(raceId);
    
    const race = data.races.find(r => r.id === raceId);
    if (race && race.status === 'completed' && race.results) {
        setParsedResults(race.results);
        setSuccess("Resultados cargados. Puedes editarlos abajo.");
        setError(null);
    } else {
        setParsedResults(null);
        setSuccess(null);
        setError(null);
    }
  };

  const startManualEntry = () => {
    if (data.drivers.length === 0) {
        setError("No hay pilotos registrados. Por favor añade pilotos primero en la pestaña 'Pilotos'.");
        return;
    }

    const manualResults: RaceResult[] = data.drivers.map((d, i) => ({
        driverId: d.id,
        position: i + 1,
        points: 0,
        fastestLap: false,
        dnf: false,
        raceTime: '-',
        fastestLapTime: '-',
        pitStops: 0
    }));
    setParsedResults(manualResults);
    setSuccess("Modo de ingreso manual activado. Por favor completa la tabla.");
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedRaceId || !parsedResults) {
      setError("Por favor selecciona una carrera y asegura que hay resultados.");
      return;
    }

    setIsSaving(true);
    try {
        const updatedRaces = data.races.map(r => {
        if (r.id === selectedRaceId) {
            return { ...r, status: 'completed' as const, results: parsedResults };
        }
        return r;
        });

        const updatedData = calculateStandings({
        ...data,
        races: updatedRaces
        });

        await dataService.saveData(updatedData, activeSeason);
        onUpdateData(updatedData);

        setSuccess("¡Datos del campeonato actualizados y guardados en la nube!");
        setParsedResults(null);
        setPreviewUrl(null);
        setSelectedRaceId('');
    } catch (err) {
        console.error("Save error:", err);
        setError("Error al guardar los datos en la nube. Verifica tu conexión.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className={cn("bg-slate-900/50 border rounded-2xl p-6 mb-8", borderColor)}>
        <div className="grid gap-6">
          <div>
            <label className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Seleccionar Carrera</label>
            <select
              value={selectedRaceId}
              onChange={handleRaceSelect}
              className={cn(
                  "w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none",
                  ringColor
              )}
            >
              <option value="">-- Selecciona una Carrera --</option>
              {[...data.races]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {r.date} ({r.status === 'completed' ? 'Completada' : 'Pendiente'})
                  </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={cn(
                  "border-2 border-dashed border-slate-700 rounded-xl p-8 text-center transition-colors bg-slate-950/30",
                  isHistorical ? "hover:border-amber-500/50" : "hover:border-red-500/50"
              )}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg shadow-lg" />
                  ) : (
                    <div className="p-4 bg-slate-800 rounded-full">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <span className="text-slate-300 font-medium">
                    {isProcessing ? 'Analizando Imagen...' : 'Subir Captura (IA)'}
                  </span>
                  {isProcessing && <Loader2 className={cn("animate-spin", accentColor)} />}
                </label>
              </div>

              <button 
                onClick={startManualEntry}
                className={cn(
                    "border-2 border-dashed border-slate-700 rounded-xl p-8 text-center transition-colors bg-slate-950/30 flex flex-col items-center justify-center gap-4 cursor-pointer",
                    isHistorical ? "hover:border-amber-500/50" : "hover:border-blue-500/50"
                )}
              >
                  <div className="p-4 bg-slate-800 rounded-full">
                      <AlertTriangle className="w-8 h-8 text-slate-400" />
                  </div>
                  <span className="text-slate-300 font-medium">Ingreso Manual / Alternativo</span>
              </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg flex items-center gap-3">
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          {parsedResults && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white italic uppercase">Revisar y Editar Datos</h3>
              <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="p-3">Pos</th>
                      <th className="p-3">Piloto</th>
                      <th className="p-3">Puntos</th>
                      <th className="p-3">VR</th>
                      <th className="p-3">Tiempo</th>
                      <th className="p-3">Pits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedResults.map((result, idx) => {
                        const driver = data.drivers.find(d => d.id === result.driverId);
                        return (
                          <tr key={idx}>
                            <td className="p-2">
                                <input 
                                    type="number" 
                                    value={result.position} 
                                    onChange={(e) => handleResultChange(idx, 'position', parseInt(e.target.value))}
                                    className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center"
                                />
                            </td>
                            <td className="p-2 text-slate-300">
                                {driver ? driver.name : result.driverId}
                            </td>
                            <td className="p-2">
                                <input 
                                    type="number" 
                                    value={result.points} 
                                    onChange={(e) => handleResultChange(idx, 'points', parseInt(e.target.value))}
                                    className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center font-bold"
                                />
                            </td>
                            <td className="p-2">
                                <input 
                                    type="checkbox" 
                                    checked={result.fastestLap} 
                                    onChange={(e) => handleResultChange(idx, 'fastestLap', e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-purple-500"
                                />
                            </td>
                            <td className="p-2">
                                <input 
                                    type="text" 
                                    value={result.raceTime} 
                                    onChange={(e) => handleResultChange(idx, 'raceTime', e.target.value)}
                                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-400 font-mono text-xs"
                                />
                            </td>
                            <td className="p-2">
                                <input 
                                    type="number" 
                                    value={result.pitStops} 
                                    onChange={(e) => handleResultChange(idx, 'pitStops', parseInt(e.target.value))}
                                    className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-400 font-mono text-xs text-center"
                                />
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
              
              <button
                onClick={handleSave}
                disabled={!selectedRaceId}
                className={cn(
                    "w-full text-white font-bold py-4 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed",
                    isHistorical ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
                )}
              >
                <Save size={20} />
                Confirmar y Actualizar Campeonato
              </button>
            </div>
          )}
        </div>
    </div>
  );
}
