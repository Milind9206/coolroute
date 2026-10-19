import { ArrowUpRight, Clock3, Sun } from "lucide-react";

export function RouteIllustration() {
  return <div className="route-illustration overflow-hidden rounded-[24px] border border-[#0B3B4F]/10 bg-white shadow-[0_28px_80px_rgba(11,59,79,0.12)]">
    <div className="flex items-center justify-between gap-4 border-b border-[#0B3B4F]/8 px-5 py-4 sm:px-6">
      <div><p className="text-sm font-semibold text-[#0B3B4F]">A walk through the city</p><p className="mt-0.5 text-xs text-[#0B3B4F]/55">Illustrative route comparison</p></div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDE68A]/55 px-3 py-1.5 text-[11px] font-semibold text-[#654B12]"><span className="h-1.5 w-1.5 rounded-full bg-[#D49B14]" /> Sample</span>
    </div>
    <div className="relative bg-[#E9F3EE]">
      <svg viewBox="0 0 660 380" role="img" aria-label="Illustrative map showing the fastest walking route in amber and the CoolRoute shaded option in teal" className="route-map-art block h-auto w-full">
        <defs>
          <pattern id="blockGrid" width="108" height="94" patternUnits="userSpaceOnUse" patternTransform="rotate(-9)">
            <rect x="9" y="10" width="38" height="30" rx="7" fill="#D7E7DF" />
            <rect x="58" y="12" width="39" height="28" rx="7" fill="#E0ECE6" />
            <rect x="20" y="51" width="30" height="31" rx="6" fill="#E0ECE6" />
            <rect x="59" y="52" width="43" height="30" rx="6" fill="#D7E7DF" />
          </pattern>
          <filter id="routeShadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dy="3"/><feComponentTransfer><feFuncA type="linear" slope="0.18"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="660" height="380" fill="#EAF4EF" />
        <rect width="660" height="380" fill="url(#blockGrid)" opacity="0.92" />
        <path d="M-20 83 C130 118 198 43 350 80 S550 137 690 93 M-10 279 C137 239 231 317 340 270 S538 229 680 282 M135 -20 C111 72 169 146 128 220 S130 323 91 400 M457 -20 C419 70 488 141 448 212 S452 320 412 400 M574 -20 C553 65 596 133 571 197 S582 304 548 400" fill="none" stroke="#FBFDFC" strokeWidth="16" />
        <path d="M-20 83 C130 118 198 43 350 80 S550 137 690 93 M-10 279 C137 239 231 317 340 270 S538 229 680 282 M135 -20 C111 72 169 146 128 220 S130 323 91 400 M457 -20 C419 70 488 141 448 212 S452 320 412 400 M574 -20 C553 65 596 133 571 197 S582 304 548 400" fill="none" stroke="#D0E0D9" strokeWidth="1.5" />
        <path d="M205 162 C253 127 307 149 347 185 S415 230 468 192 S532 147 585 170" fill="none" stroke="#B8D9C7" strokeWidth="42" strokeLinecap="round" opacity="0.75" />
        <path d="M205 162 C277 184 318 232 379 232 S482 213 585 170" fill="none" stroke="#F5A623" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="11 8" filter="url(#routeShadow)" />
        <path d="M205 162 C253 127 307 149 347 185 S415 230 468 192 S532 147 585 170" fill="none" stroke="#0F9E8E" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="url(#routeShadow)" />
        <g fill="#276B4A" opacity="0.9"><circle cx="280" cy="137" r="8"/><circle cx="302" cy="153" r="6"/><circle cx="370" cy="177" r="8"/><circle cx="398" cy="201" r="6"/><circle cx="493" cy="180" r="7"/><circle cx="520" cy="159" r="6"/><circle cx="332" cy="248" r="6"/><circle cx="474" cy="261" r="8"/></g>
        <g fill="#0B3B4F" stroke="#fff" strokeWidth="6"><circle cx="205" cy="162" r="13"/><circle cx="585" cy="170" r="13"/></g>
        <g fill="#fff" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="700" textAnchor="middle"><text x="205" y="166">A</text><text x="585" y="174">B</text></g>
        <g fontFamily="Inter, sans-serif" fontSize="11" fontWeight="600" fill="#43635A"><text x="61" y="142">TREE-LINED AVE.</text><text x="457" y="321">RIVER WALK</text><text x="277" y="331">MARKET STREET</text></g>
      </svg>
    </div>
    <div className="grid grid-cols-1 divide-y divide-[#0B3B4F]/8 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
        <span className="h-3 w-3 rounded-full bg-[#F5A623]" />
        <div className="min-w-0 flex-1"><p className="text-xs font-medium text-[#0B3B4F]/60">Fastest</p><p className="mt-0.5 text-sm font-semibold text-[#0B3B4F]">12 min <span className="font-normal text-[#0B3B4F]/55">· 78% sun</span></p></div>
        <ArrowUpRight className="text-[#0B3B4F]/35" size={17} aria-hidden="true" />
      </div>
      <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
        <span className="h-3 w-3 rounded-full bg-[#0F9E8E]" />
        <div className="min-w-0 flex-1"><p className="text-xs font-medium text-[#0B3B4F]/60">CoolRoute · sample</p><p className="mt-0.5 text-sm font-semibold text-[#0B3B4F]">14 min <span className="font-normal text-[#0B3B4F]/55">· 22% sun</span></p></div>
        <div className="flex items-center gap-1 text-xs font-semibold text-[#0F766E]"><Clock3 size={14} aria-hidden="true" /><span>+2 min</span></div>
      </div>
    </div>
    <p className="flex items-center gap-1.5 border-t border-[#0B3B4F]/8 px-5 py-3 text-[11px] leading-5 text-[#0B3B4F]/55 sm:px-6"><Sun size={13} className="shrink-0 text-[#D49B14]" aria-hidden="true" /> Illustration only. Route times and sun percentages are sample values, not a live forecast.</p>
  </div>;
}
