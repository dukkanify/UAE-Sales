import { Icon } from "@/shared/ui/Icon";
import { getHomepage3StoryBlocks } from "@/services/content/homepage3.content";
import { Home3SectionHeader } from "./Home3SectionHeader";

export async function Home3Why() {
  const blocks = await getHomepage3StoryBlocks();

  return (
    <section className="relative overflow-hidden bg-[#fffbf4] py-28">
      <div className="absolute end-0 top-24 h-72 w-72 rounded-full bg-secondary/12 blur-3xl" />
      <div className="app-container relative">
        <Home3SectionHeader
          description="ليست مجرد قوائم إعلانات. إنها تجربة تجارة محلية حديثة، مبنية حول الثقة والوضوح."
          eyebrow="Why UAE Sales"
          title="سوق يشعر بأنه صُمم للمستقبل"
        />

        <div className="grid gap-5 lg:grid-cols-4">
          {blocks.map((block, index) => (
            <article
              key={block.title}
              className={`rounded-[2rem] border border-border bg-white p-6 shadow-[var(--shadow-card)] ${
                index === 0 || index === 3 ? "lg:translate-y-8" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-black tracking-[0.2em] text-secondary uppercase">
                  {block.eyebrow}
                </p>
                <span className="grid size-10 place-items-center rounded-full bg-secondary-soft text-secondary">
                  <Icon
                    name={index === 0 ? "check" : index === 1 ? "shield" : index === 2 ? "search" : "briefcase"}
                    size={18}
                  />
                </span>
              </div>
              <p className="mt-8 text-4xl font-black text-ink">{block.metric}</p>
              <h3 className="mt-4 text-xl font-black leading-8 text-ink">
                {block.title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-muted">
                {block.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
