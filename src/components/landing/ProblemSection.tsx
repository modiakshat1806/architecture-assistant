import { motion } from "framer-motion";

const timeline = [
  { week: "Week 1", text: "Someone reads the PRD.", crossed: true },
  { week: "Week 1.5", text: "Someone re-reads the PRD.", crossed: true },
  { week: "Week 2", text: "A Notion doc gets created.", crossed: true },
  { week: "Week 2.5", text: "The Notion doc is already wrong.", crossed: true },
  { week: "Week 3", text: "Planning poker. 13 points. Nobody agrees.", crossed: true },
  { week: "Week 4", text: "Development starts. With the wrong assumptions.", crossed: true },
];

export default function ProblemSection() {
  return (
    <section className="py-24 bg-canvas bg-grid-pattern">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left — crossed-out timeline */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {timeline.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-baseline gap-4 group"
            >
              <span className="text-label-sm text-text-muted font-mono w-16 flex-shrink-0">
                {item.week}
              </span>
              <span className="text-body text-muted-foreground line-through decoration-accent-red/50">
                {item.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Right — editorial copy */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="font-satoshi text-display-lg text-foreground">
            The ritual no one
            <br />
            talks about.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
            Every engineering team loses the first month to requirements
            archaeology. Digging through ambiguous docs. Debating scope that
            was never defined. Building features no one asked for.
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-md">
            Blueprint reads your PRD in seconds. Finds every gap, every
            ambiguity, every missing edge case — and turns it into a
            structured execution plan your team can ship from day one.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
