import { motion } from "framer-motion";

const metrics = [
  { value: "47", label: "Tasks generated", suffix: "" },
  { value: "82", label: "PRD health score", suffix: "/100" },
  { value: "4", label: "Sprints planned", suffix: "" },
  { value: "< 90", label: "Seconds to process", suffix: "s" },
];

export default function MetricsBar() {
  return (
    <section className="py-16 bg-surface border-y border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-satoshi text-display-lg text-accent-orange">
                {m.value}
                <span className="text-heading-md text-muted-foreground">{m.suffix}</span>
              </div>
              <div className="mt-1 text-body text-muted-foreground">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
