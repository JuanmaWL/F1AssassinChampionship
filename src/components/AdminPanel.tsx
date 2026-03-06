import React, { useState, useRef } from 'react';
import { ChampionshipData, RaceResult } from '../types';
import { Upload, Save, Loader2, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { calculateStandings } from '../lib/calculations';

interface AdminPanelProps {
  data: ChampionshipData;
  onUpdateData: (newData: ChampionshipData) => void;
}

export function AdminPanel({ data, onUpdateData }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsedResults, setParsedResults] = useState<RaceResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple mock auth
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Contraseña incorrecta');
    }
  };

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
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });

      const base64Data = await base64Promise;

      // Initialize Gemini
      // NOTE: In a real app, ensure GEMINI_API_KEY is set in .env
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

      // Clean up response if it contains markdown code blocks
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const rawResults = JSON.parse(cleanJson);

      // Map to internal IDs
      const mappedResults: RaceResult[] = rawResults.map((r: any) => {
        const driver = data.drivers.find(d => d.name.toLowerCase().includes(r.driverName.toLowerCase().split(' ').pop()));
        return {
          driverId: driver ? driver.id : 'unknown',
          position: r.position,
          points: r.points,
          fastestLap: r.fastestLap || false,
          dnf: false,
          raceTime: r.raceTime || '-',
          fastestLapTime: r.fastestLapTime || '-'
        };
      });

      setParsedResults(mappedResults);
      setSuccess("¡IA procesó los resultados con éxito! Por favor revisa abajo.");

    } catch (err) {
      console.error("AI Parsing Error:", err);
      // Fallback mock data for demo purposes if API fails or key is missing
      setError("Fallo en IA (Verifica API Key). Cargando datos de prueba.");
      
      // Mock fallback
      setTimeout(() => {
         const mockParsed: RaceResult[] = data.drivers.map((d, i) => ({
            driverId: d.id,
            position: i + 1,
            points: i === 0 ? 25 : i === 1 ? 18 : i === 2 ? 15 : 0,
            fastestLap: i === 0,
            dnf: false,
            raceTime: i === 0 ? "1:30:00.000" : `+${i * 2}.000s`,
            fastestLapTime: "1:18.500"
         })).slice(0, 10);
         setParsedResults(mockParsed);
         setError(null);
         setSuccess("Datos de prueba cargados (Modo Demo)");
      }, 1000);
    }
  };

  const handleSave = () => {
    if (!selectedRaceId || !parsedResults) {
      setError("Por favor selecciona una carrera y asegura que hay resultados.");
      return;
    }

    const updatedRaces = data.races.map(r => {
      if (r.id === selectedRaceId) {
        return { ...r, status: 'completed' as const, results: parsedResults };
      }
      return r;
    });

    // Recalculate standings using the centralized function
    const updatedData = calculateStandings({
      ...data,
      races: updatedRaces
    });

    onUpdateData(updatedData);

    setSuccess("¡Datos del campeonato actualizados con éxito!");
    setParsedResults(null);
    setPreviewUrl(null);
    setSelectedRaceId('');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/10 rounded-full">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black italic text-white text-center mb-6 uppercase">Acceso Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa Contraseña (admin123)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-colors"
            >
              Desbloquear Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <h2 className="text-3xl font-black italic text-white mb-8 uppercase tracking-tighter flex items-center gap-3">
        <Upload className="w-8 h-8 text-red-500" />
        Procesador de Resultados
      </h2>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
        <div className="grid gap-6">
          {/* Race Selection */}
          <div>
            <label className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Seleccionar Carrera</label>
            <select
              value={selectedRaceId}
              onChange={(e) => setSelectedRaceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">-- Selecciona una Carrera --</option>
              {data.races.filter(r => r.status === 'pending').map(r => (
                <option key={r.id} value={r.id}>{r.name} - {r.date}</option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-red-500/50 transition-colors bg-slate-950/30">
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
                <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg shadow-lg" />
              ) : (
                <div className="p-4 bg-slate-800 rounded-full">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <span className="text-slate-300 font-medium">
                {isProcessing ? 'Analizando Imagen con Gemini AI...' : 'Click para subir captura de resultados'}
              </span>
              {isProcessing && <Loader2 className="animate-spin text-red-500" />}
            </label>
          </div>

          {/* Messages */}
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

          {/* Parsed Results Editor */}
          {parsedResults && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white italic uppercase">Revisar Datos</h3>
              <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="p-3">Pos</th>
                      <th className="p-3">Piloto ID</th>
                      <th className="p-3">Puntos</th>
                      <th className="p-3">VR</th>
                      <th className="p-3">Tiempo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedResults.map((result, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-white font-mono">{result.position}</td>
                        <td className="p-3 text-slate-300">{result.driverId}</td>
                        <td className="p-3 text-white font-bold">{result.points}</td>
                        <td className="p-3">
                          {result.fastestLap && <span className="text-purple-400 text-xs border border-purple-500/30 px-1 rounded">RÁPIDA</span>}
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-xs">
                            {result.raceTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button
                onClick={handleSave}
                disabled={!selectedRaceId}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Save size={20} />
                Confirmar y Actualizar Campeonato
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
