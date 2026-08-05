"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Compass, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function HomePage() {
  return (
    <>
      {/* Hero — full-bleed aviation composition */}
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="hero-aviation absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(56,189,248,0.25),_transparent_55%)]" />

        <div className="container-app relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-center py-20">
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-accent"
          >
            {siteConfig.name}
          </motion.p>
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-3xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Aviation education built for the next generation of pilots
          </motion.h1>
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 max-w-xl text-base text-white/80 sm:text-lg"
          >
            Professional consultation and training from Eager Pilots — structured
            programs, expert guidance, and a platform ready for your journey.
          </motion.p>
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Button size="lg" variant="accent" asChild>
              <Link href={routes.register}>
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              asChild
            >
              <Link href={routes.login}>Sign in</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Single-purpose section: pillars */}
      <section id="programs" className="border-b border-border bg-card py-20">
        <div className="container-app">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary">
            Built for serious aviation training
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A modular platform foundation designed for consultation, coursework,
            and operational excellence.
          </p>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Structured learning",
                body: "Curriculum-ready architecture for courses, modules, and progress tracking.",
              },
              {
                icon: Compass,
                title: "Expert consultation",
                body: "Connect learners with instructors through a secure, role-aware workspace.",
              },
              {
                icon: Shield,
                title: "Enterprise security",
                body: "Supabase Auth, Row Level Security, and protected routes from day one.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-xl font-semibold text-primary">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-background py-20">
        <div className="container-app max-w-3xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary">
            About {siteConfig.name}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {siteConfig.legalName} delivers professional aviation education and
            consultation. This platform foundation establishes the design system,
            authentication, database, and layout architecture for future product
            features.
          </p>
        </div>
      </section>

      <section id="contact" className="border-t border-border bg-card py-20">
        <div className="container-app flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-primary">
              Ready to take off?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Contact us at{" "}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="font-medium text-accent-foreground underline decoration-accent underline-offset-4"
              >
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>
          <Button asChild>
            <Link href={routes.register}>Create your account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
