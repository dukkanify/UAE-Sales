import { Icon } from "@/shared/ui/Icon";

const trustItems = [
  {
    description: "حسابات وبائعون بمعايير ثقة واضحة",
    icon: "check",
    title: "Verified",
  },
  {
    description: "ضمان مالي يحمي المشتري والبائع",
    icon: "shield",
    title: "Escrow",
  },
  {
    description: "تجربة دفع آمنة وجاهزة للتكامل",
    icon: "wallet",
    title: "Secure Payments",
  },
] as const;

export function Home3TrustBar() {
  return (
    <section className="bg-[#fffbf4] pb-8">
      <div className="app-container">
        <div className="-mt-10 grid gap-4 rounded-[2rem] border border-white/80 bg-white/92 p-4 shadow-[0_22px_70px_rgb(15_20_25/10%)] backdrop-blur-xl md:grid-cols-3">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-[1.5rem] bg-[#fffbf4] px-5 py-4"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-[1rem] bg-secondary-soft text-secondary">
                <Icon name={item.icon} size={20} />
              </span>
              <div>
                <h3 className="text-sm font-black text-ink">{item.title}</h3>
                <p className="mt-1 text-xs font-semibold leading-6 text-muted">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
