import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Added Link import
import { Link } from "react-router-dom";
import DependencyGraphVisual from "./DependencyGraphVisual";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-canvas bg-grid-pattern overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 pt-24 pb-16 w-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
        {/* Left — copy */}
        <div className="z-10">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-satoshi text-display-xl text-foreground leading-tight"
          >
            Architecture
            <br />
            begins <span className="text-gradient-orange">here.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed"
          >
            Upload any PRD. Blueprint extracts requirements, generates tasks, designs
            architecture, and scaffolds your codebase — before your first standup.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex gap-4"
          >
            {/* Updated to Link pointing to /auth */}
            <Link
              to="/auth"
              className="h-12 px-8 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-body hover:scale-[1.02] hover:brightness-110 transition-all glow-orange"
            >
              Upload PRD
            </Link>
            <a
              href="#"
            </a>
            <Link
              to="/demo"
              className="h-12 px-8 inline-flex items-center justify-center rounded-lg border border-border text-foreground font-medium text-body hover:bg-overlay transition-all"
            >
              View Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex items-center gap-4"
          >
            <span className="text-label-sm text-muted-foreground">
              Trusted by 1,200+ engineering teams
            </span>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-16 h-5 rounded bg-overlay"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — dependency graph */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative hidden lg:block"
        >
          <DependencyGraphVisual />
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
    </section>
  );
}