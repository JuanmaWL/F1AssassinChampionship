import React, { useState, useEffect } from 'react';
import { ChampionshipData, SeasonId, Driver, Constructor, Race, RaceResult } from '../../types';
import { Upload, Download, AlertTriangle, Check, FileJson, FileText, Bot, Database, Users, Flag, Trophy, Calendar as CalendarIcon, Image as ImageIcon, X, Edit } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface JsonImporterProps {
  currentData: ChampionshipData;
  onUpdateData: (newData: ChampionshipData) => void;
  activeSeason: SeasonId;
  isHistorical: boolean;
}

type ImportSection = 'full' | 'drivers' | 'teams' | 'calendar' | 'results' | 'edit';

export function JsonImporter({ currentData, onUpdateData, activeSeason, isHistorical }: JsonImporterProps) {
  const [activeSection, setActiveSection] = useState<ImportSection>('full');
  const [jsonContent, setJsonContent] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const buttonColor = isHistorical ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700";
  const accentColor = isHistorical ? "text-amber-500" : "text-red-500";

  // Load current data into JSON editor when switching to 'edit' mode
  useEffect(() => {
    if (activeSection === 'edit') {
      setJsonContent(JSON.stringify(currentData, null, 2));
      setError(null);
      setSuccess(null);
    }
  }, [activeSection, currentData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'json' | 'text' | 'image') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (type === 'json') {
        setJsonContent(content);
      } else if (type === 'text') {
        setTextContent(content);
      } else if (type === 'image') {
        setImagePreview(content);
        setImageType(file.type);
      }
      setError(null);
      setSuccess(null);
    };

    if (type === 'image') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageType('');
  };

  const validateFullData = (data: any): data is ChampionshipData => {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.drivers)) return false;
    if (!Array.isArray(data.constructors) && !Array.isArray(data.teams)) return false; // Support both for legacy/flexibility
    if (!Array.isArray(data.races)) return false;
    return true;
  };

  const processWithAI = async (promptType: 'drivers' | 'teams' | 'calendar') => {
    if (!textContent && !imagePreview) {
      setError("Por favor introduce texto, sube un archivo de texto o una imagen primero.");
      return;
    }

    setIsProcessingAI(true);
    setError(null);
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key de Gemini no configurada.");

      const ai = new GoogleGenAI({ apiKey });
      
      let systemPrompt = "";
      if (promptType === 'drivers') {
        systemPrompt = `
          Extract a list of F1 drivers from the text or image provided. 
          Return ONLY a valid JSON array of objects with this interface:
          interface Driver {
            id: string; // kebab-case name (e.g. "max-verstappen")
            name: string; // Full name
            team: string; // Team name if mentioned, else "Unknown"
            teamColor: string; // Hex color if mentioned or known, else "#000000"
            points: number; // Default to 0
            avatarUrl: string; // Default to "https://api.dicebear.com/7.x/avataaars/svg?seed=[id]"
          }
        `;
      } else if (promptType === 'teams') {
        systemPrompt = `
          Extract a list of F1 teams/constructors from the text or image provided.
          Return ONLY a valid JSON array of objects with this interface:
          interface Constructor {
            id: string; // kebab-case name
            name: string; // Full name
            color: string; // Hex color if mentioned or known, else "#000000"
            points: number; // Default to 0
            logoUrl: string; // Default to empty string or placeholder
          }
        `;
      } else if (promptType === 'calendar') {
        systemPrompt = `
          Extract a list of F1 races/calendar from the text or image provided.
          Return ONLY a valid JSON array of objects with this interface:
          interface Race {
            id: string; // kebab-case name (e.g. "bahrain-gp")
            name: string; // e.g. "Bahrain Grand Prix"
            circuit: string; // Circuit name
            date: string; // ISO 8601 date string (YYYY-MM-DD), infer year ${activeSeason} if missing
            flagCode: string; // 2-letter ISO country code (lowercase)
            status: "pending";
          }
        `;
      }

      const parts: any[] = [{ text: systemPrompt }];

      if (imagePreview) {
        const base64Data = imagePreview.split(',')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: imageType
          }
        });
        parts.push({ text: "Extract data from this image." });
      }

      if (textContent) {
        parts.push({ text: "Input Text:" });
        parts.push({ text: textContent });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: { parts: parts }
      });

      const responseText = response.text;
      if (!responseText) throw new Error("La IA no devolvió texto.");

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error("No se pudo extraer JSON válido de la respuesta de la IA.");
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      setJsonContent(JSON.stringify(parsedData, null, 2));
      setSuccess("IA ha procesado el contenido. Revisa el JSON generado antes de importar.");
      setTextContent(''); // Clear text input to focus user on JSON
      clearImage(); // Clear image after processing
    } catch (err: any) {
      console.error("AI Error:", err);
      setError(err.message || "Error al procesar con IA.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleImport = async () => {
    if (!jsonContent) {
      setError("Por favor selecciona un archivo JSON o genera uno con IA primero.");
      return;
    }

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const parsedData = JSON.parse(jsonContent);
      let newData = { ...currentData };

      if (activeSection === 'full' || activeSection === 'edit') {
        if (!validateFullData(parsedData)) {
          throw new Error("JSON inválido para base de datos completa.");
        }
        // Handle 'teams' vs 'constructors' key compatibility
        const constructors = parsedData.constructors || (parsedData as any).teams;
        newData = {
          drivers: parsedData.drivers,
          constructors: constructors,
          races: parsedData.races
        };
      } else if (activeSection === 'drivers') {
        if (!Array.isArray(parsedData)) throw new Error("El JSON debe ser un array de pilotos.");
        newData.drivers = parsedData;
      } else if (activeSection === 'teams') {
        if (!Array.isArray(parsedData)) throw new Error("El JSON debe ser un array de escuderías.");
        newData.constructors = parsedData;
      } else if (activeSection === 'calendar') {
        if (!Array.isArray(parsedData)) throw new Error("El JSON debe ser un array de carreras.");
        // Preserve results if race IDs match? For now, let's assume replacement but warn user.
        // Or better: Try to merge results if IDs match.
        const mergedRaces = parsedData.map((newRace: Race) => {
          const existingRace = currentData.races.find(r => r.id === newRace.id);
          if (existingRace && existingRace.results) {
            return { ...newRace, results: existingRace.results, status: existingRace.status };
          }
          return newRace;
        });
        newData.races = mergedRaces;
      } else if (activeSection === 'results') {
        // Expecting array of { raceId: string, results: RaceResult[] }
        if (!Array.isArray(parsedData)) throw new Error("El JSON debe ser un array de objetos con raceId y results.");
        
        const updatedRaces = [...currentData.races];
        let updateCount = 0;

        parsedData.forEach((item: any) => {
          if (item.raceId && Array.isArray(item.results)) {
            const raceIndex = updatedRaces.findIndex(r => r.id === item.raceId);
            if (raceIndex !== -1) {
              updatedRaces[raceIndex] = {
                ...updatedRaces[raceIndex],
                results: item.results,
                status: 'completed'
              };
              updateCount++;
            }
          }
        });
        
        if (updateCount === 0) throw new Error("No se encontraron carreras coincidentes para actualizar resultados.");
        newData.races = updatedRaces;
        setSuccess(`Se actualizaron los resultados de ${updateCount} carreras.`);
      }

      await dataService.saveData(newData, activeSeason);
      onUpdateData(newData);
      if (activeSection !== 'results') { // Custom message for results already set
        setSuccess(`Datos de ${activeSection === 'full' ? 'base de datos completa' : activeSection} importados correctamente.`);
      }
      setJsonContent('');
    } catch (err: any) {
      console.error("Import error:", err);
      setError(err.message || "Error al importar los datos.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    let dataToExport: any = currentData;
    let fileNamePrefix = `f1-${activeSeason}`;

    if (activeSection === 'drivers') {
      dataToExport = currentData.drivers;
      fileNamePrefix += '-drivers';
    } else if (activeSection === 'teams') {
      dataToExport = currentData.constructors;
      fileNamePrefix += '-teams';
    } else if (activeSection === 'calendar') {
      // Export races without results to keep it clean for calendar editing?
      // Or keep it full? User said "individualmente". 
      // Usually calendar export implies the schedule.
      dataToExport = currentData.races.map(({ results, ...rest }) => rest);
      fileNamePrefix += '-calendar';
    } else if (activeSection === 'results') {
      // Export only results map
      dataToExport = currentData.races
        .filter(r => r.results && r.results.length > 0)
        .map(r => ({
          raceId: r.id,
          raceName: r.name,
          results: r.results
        }));
      fileNamePrefix += '-results';
    } else {
      fileNamePrefix += '-full-db';
    }

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileName = `${fileNamePrefix}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };

  const tabsGroup1: { id: ImportSection; label: string; icon: React.ElementType }[] = [
    { id: 'teams', label: 'Escuderías', icon: Trophy },
    { id: 'drivers', label: 'Pilotos', icon: Users },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'results', label: 'Resultados', icon: Flag },
  ];

  const tabsGroup2: { id: ImportSection; label: string; icon: React.ElementType }[] = [
    { id: 'full', label: 'Completo', icon: Database },
    { id: 'edit', label: 'Editor JSON', icon: Edit },
  ];

  const getPlaceholderText = () => {
    switch (activeSection) {
      case 'drivers':
        return `Ejemplo:\nMax Verstappen (Red Bull) - #1\nLewis Hamilton (Ferrari) - #44\n...`;
      case 'teams':
        return `Ejemplo:\nRed Bull Racing (Azul oscuro)\nFerrari (Rojo)\nMercedes (Plateado/Negro)\n...`;
      case 'calendar':
        return `Ejemplo:\nGP de Bahrein - 2 de Marzo\nGP de Arabia Saudita - 9 de Marzo\n...`;
      default:
        return `Pega aquí el texto o sube una imagen...`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 mb-2">
        <h3 className="text-xl font-bold text-white italic uppercase">Gestión de Datos</h3>
        
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
            {tabsGroup1.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  setJsonContent('');
                  setTextContent('');
                  setImagePreview(null);
                  setImageType('');
                  setError(null);
                  setSuccess(null);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                  activeSection === tab.id
                    ? cn("bg-white text-slate-900 shadow-sm", isHistorical && "bg-amber-500 text-black")
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
            {tabsGroup2.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  setJsonContent('');
                  setTextContent('');
                  setImagePreview(null);
                  setImageType('');
                  setError(null);
                  setSuccess(null);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                  activeSection === tab.id
                    ? cn("bg-white text-slate-900 shadow-sm", isHistorical && "bg-amber-500 text-black")
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Methods */}
        <div className="space-y-6">
          
          {/* AI / Text Input Section (Only for Drivers, Teams, Calendar) */}
          {['drivers', 'teams', 'calendar'].includes(activeSection) && (
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <Bot className="text-purple-400" size={24} />
                <h4 className="font-bold text-lg">Generar con IA</h4>
              </div>
              <p className="text-slate-400 text-sm">
                Pega texto, sube un archivo o una imagen. La IA intentará estructurarlo automáticamente.
              </p>
              
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={getPlaceholderText()}
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-purple-500 transition-colors"
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-700 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  <button 
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[120px]">
                  <input 
                    type="file" 
                    accept=".txt,.md,.csv"
                    onChange={(e) => handleFileUpload(e, 'text')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg border border-white/10 flex items-center justify-center gap-2">
                    <FileText size={14} /> Subir TXT
                  </button>
                </div>

                <div className="relative flex-1 min-w-[120px]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg border border-white/10 flex items-center justify-center gap-2">
                    <ImageIcon size={14} /> Subir Imagen
                  </button>
                </div>

                <button
                  onClick={() => processWithAI(activeSection as 'drivers' | 'teams' | 'calendar')}
                  disabled={(!textContent && !imagePreview) || isProcessingAI}
                  className="w-full md:w-auto px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessingAI ? <span className="animate-pulse">Procesando...</span> : <>
                    <Bot size={14} /> Procesar
                  </>}
                </button>
              </div>
            </div>
          )}

          {/* JSON Input Section */}
          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-white mb-2">
              {activeSection === 'edit' ? <Edit className="text-blue-400" size={24} /> : <Upload className="text-blue-400" size={24} />}
              <h4 className="font-bold text-lg">{activeSection === 'edit' ? 'Editor en Tiempo Real' : 'Importar JSON'}</h4>
            </div>
            <p className="text-slate-400 text-sm">
              {activeSection === 'full' 
                ? "Reemplaza TODA la base de datos." 
                : activeSection === 'edit'
                ? "Edita el JSON directamente. Útil para cambiar URLs de imágenes o corregir datos rápidamente."
                : `Reemplaza/Actualiza la lista de ${activeSection}.`}
            </p>
            
            <div className="relative">
              <textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                placeholder={activeSection === 'full' ? '{ "drivers": [], ... }' : '[ ... ]'}
                className="w-full h-96 bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
              {activeSection !== 'edit' && (
                <div className="absolute bottom-3 right-3">
                  <div className="relative inline-block">
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={(e) => handleFileUpload(e, 'json')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md border border-slate-600 shadow-sm transition-colors" title="Subir archivo JSON">
                      <FileJson size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-xs flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0" />
                {success}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!jsonContent || isImporting}
              className={cn(
                "w-full py-3 rounded-lg text-white font-bold uppercase text-sm tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                buttonColor
              )}
            >
              {isImporting ? "Guardando..." : (activeSection === 'edit' ? "Guardar Cambios" : "Confirmar Importación")}
            </button>
          </div>
        </div>

        {/* Right Column: Export & Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-3 text-white mb-2">
              <Download className="text-green-400" size={24} />
              <h4 className="font-bold text-lg">Exportar Actual</h4>
            </div>
            <p className="text-slate-400 text-sm">
              Descarga el JSON actual de {activeSection === 'full' ? 'toda la base de datos' : activeSection}.
            </p>
            
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-500 overflow-hidden flex-1 min-h-[200px] relative">
              <pre>{JSON.stringify(
                activeSection === 'full' ? currentData : 
                activeSection === 'drivers' ? currentData.drivers :
                activeSection === 'teams' ? currentData.constructors :
                activeSection === 'calendar' ? currentData.races.map(({results, ...r}) => r) :
                currentData.races.filter(r => r.results?.length).map(r => ({id: r.id, results: r.results})), 
                null, 2
              ).slice(0, 1000)}...</pre>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90 pointer-events-none" />
            </div>

            <button
              onClick={handleExport}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase text-sm tracking-wider rounded-lg transition-colors border border-white/10 flex items-center justify-center gap-2 mt-auto"
            >
              <Download size={16} /> Descargar JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
