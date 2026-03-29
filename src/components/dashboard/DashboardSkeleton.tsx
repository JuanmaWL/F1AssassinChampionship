export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-20 animate-pulse">
      {/* Banner */}
      <div className="w-full h-48 md:h-64 rounded-2xl bg-slate-800/50"></div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 rounded-xl bg-slate-800/50"></div>
        <div className="h-24 rounded-xl bg-slate-800/50"></div>
        <div className="h-24 rounded-xl bg-slate-800/50"></div>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-4 h-48">
        <div className="w-24 h-32 rounded-t-xl bg-slate-800/50"></div>
        <div className="w-24 h-48 rounded-t-xl bg-slate-800/50"></div>
        <div className="w-24 h-24 rounded-t-xl bg-slate-800/50"></div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/20">
            <div className="w-10 h-10 rounded-full bg-slate-800/50 shrink-0"></div>
            <div className="flex-grow flex items-center gap-4">
              <div className="h-4 w-1/3 rounded-full bg-slate-800/50"></div>
              <div className="h-4 w-1/4 rounded-full bg-slate-800/50"></div>
              <div className="h-4 w-1/5 rounded-full bg-slate-800/50 ml-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
