const FLAGS: Record<string, string> = {
  en: "🇺🇸",
  hi: "🇮🇳",
  ar: "🇸🇦",
  ja: "🇯🇵",
  de: "🇩🇪",
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  return (
    <div className="flex gap-2">
      {Object.entries(FLAGS).map(([code, country]) => (
        <a
          key={code}
          href={`/${code}`}
          className={`rounded-full px-3 py-1.5 text-sm transition-all ${
            currentLocale === code
              ? "bg-indigo-600 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {country} {code.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
