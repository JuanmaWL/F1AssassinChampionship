import { Youtube, Github, ExternalLink, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChampionship } from '../../context/ChampionshipContext';
import { FOOTER_ASSETS } from '../../constants/assets';

const XIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
  </svg>
);

export function Footer() {
  const { isHistorical } = useChampionship();

  const collaborators = [
    {
      name: "Alvillas",
      role: "Organizador",
      image: FOOTER_ASSETS.ALVILLAS,
      twitter: "https://x.com/Alvillasvqk",
      youtube: "https://www.youtube.com/@alvillasvqk"
    },
    {
      name: "Uyimero",
      role: "Diseño Gráfico",
      image: FOOTER_ASSETS.UYIMERO,
      twitter: "https://x.com/Uyimero",
      youtube: "https://www.youtube.com/@Uyimero"
    },
    {
      name: "Juasmo",
      role: "Desarrollo Web",
      image: FOOTER_ASSETS.JUASMO,
      twitter: "https://x.com/juanmawl",
      youtube: "https://www.youtube.com/@Juasmo"
    }
  ];

  return (
    <footer className={cn(
      "relative mt-auto border-t transition-colors duration-500 overflow-hidden group",
      isHistorical ? "bg-slate-950 border-amber-900/30" : "bg-slate-950 border-white/5"
    )}>
      {/* Wallpaper Background with care */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <img 
          src={FOOTER_ASSETS.WALLPAPER} 
          alt="F1 Wallpaper" 
          className="w-full h-full object-cover object-center scale-100 group-hover:scale-125 group-hover:rotate-1 group-hover:brightness-125 transition-all duration-[8s] ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Scanline effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 to-transparent" />
      </div>

      {/* Decorative top line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent z-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Brand & Official */}
          <div className="flex flex-col items-center md:items-start space-y-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transform -skew-x-12 shadow-2xl transition-all duration-500 group-hover:rotate-3",
                isHistorical ? "bg-gradient-to-br from-amber-600 to-amber-800" : "bg-gradient-to-br from-red-600 to-red-800"
              )}>
                <Trophy className="text-white w-7 h-7 transform skew-x-12" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                  F1 <span className={isHistorical ? "text-amber-500" : "text-red-500"}>Assassins</span>
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-1.5">Championship</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isHistorical ? "bg-amber-500" : "bg-red-500")} />
                Cuenta Oficial
              </span>
              <a 
                href="https://x.com/F1Assassins" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "group/btn flex items-center gap-4 px-8 py-4 rounded-2xl transition-all duration-500 backdrop-blur-md border shadow-2xl relative overflow-hidden",
                  isHistorical 
                    ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/20 hover:shadow-amber-500/20" 
                    : "bg-red-500/10 border-red-500/30 hover:border-red-500 hover:bg-red-500/20 hover:shadow-red-500/20"
                )}
              >
                {/* Animated background glow */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500",
                  isHistorical ? "bg-amber-500" : "bg-red-500"
                )} />
                
                <XIcon size={22} className="text-white group-hover/btn:scale-110 transition-transform relative z-10" />
                <div className="flex flex-col relative z-10">
                  <span className="text-xs font-black text-slate-400 group-hover/btn:text-slate-300 transition-colors tracking-widest uppercase">Síguenos en X</span>
                  <span className="text-lg font-black text-white transition-colors tracking-tight">@F1Assassins</span>
                </div>
                <ExternalLink size={16} className="text-slate-500 group-hover/btn:text-white transition-all opacity-0 group-hover/btn:opacity-100 translate-x-[-4px] group-hover/btn:translate-x-0 relative z-10" />
              </a>
            </div>
          </div>

          {/* Collaborators */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-10">
            {collaborators.map((collab) => (
              <div key={collab.name} className="flex flex-col items-center sm:items-start space-y-6 group/collab">
                <div className="flex items-center gap-5 text-center sm:text-left relative">
                  {/* Profile Image Frame */}
                  <div className={cn(
                    "w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-500 group-hover/collab:scale-110 group-hover/collab:rotate-3 shadow-2xl flex-shrink-0",
                    isHistorical ? "border-amber-500/30 group-hover/collab:border-amber-500" : "border-white/10 group-hover/collab:border-red-500"
                  )}>
                    <img 
                      src={collab.image} 
                      alt={collab.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white font-black italic uppercase tracking-tight text-xl relative inline-block whitespace-nowrap">
                      {/* Main Name */}
                      <span className="relative z-10">{collab.name}</span>
                      
                      {/* Glitch Layers */}
                      <span className="absolute top-0 left-0 -z-10 text-red-500 opacity-0 group-hover/collab:opacity-70 group-hover/collab:animate-[glitch-1_0.8s_infinite_linear_alternate-reverse] pointer-events-none" style={{ clipPath: 'inset(0 0 0 0)' }}>
                        {collab.name}
                      </span>
                      <span className="absolute top-0 left-0 -z-10 text-blue-500 opacity-0 group-hover/collab:opacity-70 group-hover/collab:animate-[glitch-2_0.8s_infinite_linear_alternate-reverse] pointer-events-none" style={{ clipPath: 'inset(0 0 0 0)' }}>
                        {collab.name}
                      </span>
                    </h3>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 h-4">
                      <div className="w-5 flex items-center justify-center sm:justify-start">
                        <div className={cn(
                          "h-[1px] transition-all duration-500",
                          isHistorical ? "bg-amber-500/50" : "bg-red-500/50",
                          "w-2 group-hover/collab:w-5"
                        )} />
                      </div>
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 whitespace-nowrap",
                        isHistorical ? "text-amber-500/80 group-hover/collab:text-amber-400" : "text-red-500/80 group-hover/collab:text-red-400"
                      )}>{collab.role}</p>
                    </div>

                    {/* Socials integrated below role */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                      <a 
                        href={collab.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 border border-white/5 transition-all duration-300 hover:-translate-y-0.5"
                        title={`Twitter de ${collab.name}`}
                      >
                        <XIcon size={14} />
                      </a>
                      <a 
                        href={collab.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white/10 border border-white/5 transition-all duration-300 hover:-translate-y-0.5"
                        title={`YouTube de ${collab.name}`}
                      >
                        <Youtube size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} F1 ASSASSINS CHAMPIONSHIP
            </p>
            <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-slate-500 group/juasmo">
              Developed by <span className="text-white font-black transition-colors duration-500 cursor-default relative inline-block">
                <span className="relative z-10">Juasmo</span>
                {/* Glitch Layers for Juasmo */}
                <span className="absolute top-0 left-0 -z-10 text-red-500 opacity-0 group-hover/juasmo:opacity-70 group-hover/juasmo:animate-[glitch-1_0.8s_infinite_linear_alternate-reverse] pointer-events-none" style={{ clipPath: 'inset(0 0 0 0)' }}>
                  Juasmo
                </span>
                <span className="absolute top-0 left-0 -z-10 text-blue-500 opacity-0 group-hover/juasmo:opacity-70 group-hover/juasmo:animate-[glitch-2_0.8s_infinite_linear_alternate-reverse] pointer-events-none" style={{ clipPath: 'inset(0 0 0 0)' }}>
                  Juasmo
                </span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-8">
            <a 
              href="https://github.com/JuanmaWL/F1AssassinChampionship" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-slate-500 hover:text-white transition-all group/gh hover:-translate-y-0.5"
            >
              <Github size={18} className="group-hover/gh:rotate-12 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">GitHub</span>
            </a>
            <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Trophy size={12} className={isHistorical ? "text-amber-500" : "text-red-500"} />
              <span>Webapp oficial del campeonato</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom accent */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-[2px] opacity-30",
        isHistorical ? "bg-amber-500" : "bg-red-500"
      )} />
    </footer>
  );
}
