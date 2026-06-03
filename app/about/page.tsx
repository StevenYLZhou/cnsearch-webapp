export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">About This Database</h1>
        <p className="text-gray-500 mt-1 text-sm">Methodology, sources, and citation guide</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Scope</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          This database tracks legal disputes arising from US tariff actions targeting China under
          Section 301, Section 232, Section 201, and IEEPA, spanning two distinct phases of the
          US–China trade war. It covers both private commercial contract disputes between Chinese
          and US parties and administrative/constitutional challenges to the tariff authority itself.
        </p>
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="font-medium text-blue-900 text-sm">Phase 1 — 2018 to 2022</p>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Trump first term. Section 301 Lists 1–4B, Section 232 steel and aluminum.
              Phase One Agreement (January 2020). Many USCIT challenges now decided.
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="font-medium text-red-900 text-sm">Phase 2 — 2025 to present</p>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              Trump second term. Sweeping IEEPA tariffs, escalated Section 301 rates.
              Chinese retaliatory tariffs and export controls on critical minerals.
              Most litigation still pending.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Source Tiers</h2>
        <div className="space-y-3">
          {[
            {
              tier: 'Tier 1',
              color: 'bg-green-100 text-green-800',
              label: 'Primary Court & Official Documents',
              desc: 'USCIT docket opinions, CAFC published decisions, PACER federal court filings, WTO Dispute Settlement panel/AB reports, Federal Register notices.',
              required: true,
            },
            {
              tier: 'Tier 2',
              color: 'bg-yellow-100 text-yellow-800',
              label: 'Corroborating Sources',
              desc: 'Law360, Reuters Legal, Bloomberg Law, HeinOnline law review articles, SSRN working papers.',
              required: false,
            },
            {
              tier: 'Tier 3',
              color: 'bg-gray-100 text-gray-800',
              label: 'Commentary & Leads',
              desc: 'White & Case, Crowell & Moring, Akin Gump client alerts; PIIE working papers. Used for leads and context only.',
              required: false,
            },
          ].map(s => (
            <div key={s.tier} className="flex gap-3">
              <span className={`text-xs font-medium px-2 py-1 rounded h-fit shrink-0 ${s.color}`}>{s.tier}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{s.label} {s.required && <span className="text-xs text-red-500">(≥2 required per record)</span>}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Confidence Levels</h2>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium text-green-700">High</span> — Outcome verified against primary court document; full record available.</p>
          <p><span className="font-medium text-yellow-700">Medium</span> — Outcome verified from Tier-2 source; primary document not retrieved.</p>
          <p><span className="font-medium text-gray-700">Low</span> — Case reported but outcome unknown or only partially confirmed.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">How to Cite</h2>
        <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-700 leading-relaxed">
          US–China Tariff Dispute Database (2026). University of San Francisco Research
          Assistant Project. Data freeze date: [see individual record]. Retrieved from [URL].
        </div>
        <p className="text-xs text-gray-500">
          Each case record shows its freeze date — the date when the case information was last verified.
          Litigation is ongoing; always verify current status before citing in legal or policy work.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-2">
        <h2 className="font-semibold text-gray-900">Updates</h2>
        <p className="text-sm text-gray-700">
          The database is updated manually on a periodic basis. Each update cycle is logged with a
          record count and date. New cases are added as they are identified in public dockets and
          reported sources.
        </p>
      </div>
    </div>
  )
}
