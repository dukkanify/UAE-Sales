"use client";

type Tab = {
  count?: number;
  id: string;
  label: string;
};

type TabsProps = {
  activeId: string;
  onChange: (id: string) => void;
  tabs: Tab[];
};

export function Tabs({ activeId, onChange, tabs }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;

        return (
          <button
            key={tab.id}
            aria-selected={isActive}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition duration-200 ${
              isActive
                ? "bg-primary text-white shadow-[var(--shadow-sm)]"
                : "bg-surface-muted text-muted hover:text-ink"
            }`}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs ${
                  isActive ? "bg-white/15" : "bg-surface"
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
