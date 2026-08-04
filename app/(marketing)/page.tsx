"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Plane, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { brandingConfig } from "@/config/branding";
import { routes } from "@/constants/routes";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 + i * 0.1,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[calc(100vh-4.5rem)] overflow-hidden">
        <div className="hero-aviation absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A24] via-transparent to-transparent opacity-80" />

        <div className="container-app relative z-10 flex min-h-[calc(100vh-4.5rem)] flex-col justify-center py-20">
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-4 font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="text-[#5BA3C9]">ATPL</span> <span className="text-accent">PASS</span>
          </motion.p>
          <motion.p
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.28em] text-white/70"
          >
            {brandingConfig.tagline}
          </motion.p>
          <motion.h1
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-2xl font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            Aviation training built for precision and exam readiness
          </motion.h1>
          <motion.p
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          >
            World-class virtual education for future pilots — coursework, live classes, and
            assessments in one focused platform.
          </motion.p>
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Button size="lg" variant="accent" className="shadow-medium" asChild>
              <Link href={routes.register}>
                Prepare for takeoff
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/25 bg-white/5 text-white backdrop-blur-sm hover:bg-white/12 hover:text-white"
              asChild
            >
              <Link href={routes.login}>Sign in</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="programs" className="border-b border-border bg-card py-24">
        <div className="container-app">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Programs
          </p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Master your ATPL exams from anywhere
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            A precise, distraction-free learning platform built for serious cadets — coursework,
            live classes, assessments, and certification in one place.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Academic excellence",
                body: "Structured courses and assessments grounded in ATPL theory — clear, rigorous, exam-ready.",
              },
              {
                icon: Plane,
                title: "Live flight-path learning",
                body: "Instructor-led sessions, calendars, and progress tracking that keep your training on course.",
              },
              {
                icon: ShieldCheck,
                title: "Trusted operations",
                body: "Role-based access, secure sessions, and enterprise-ready controls for academies and cadets.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center text-primary">
                  <item.icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-background py-24">
        <div className="container-app grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              About
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Precision. Clarity. Authority.
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground leading-relaxed">
              {siteConfig.legalName} bridges theoretical mastery and practical readiness. Primary
              locations: {siteConfig.locations.join(" and ")}. Training that reflects the discipline
              of aviation itself.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0B1A24] p-8 text-white shadow-medium">
            <p className="font-display text-2xl font-semibold tracking-tight">
              Prepare for takeoff.
            </p>
            <p className="mt-3 text-sm text-white/65 leading-relaxed">
              Join cadets mastering ATPL exams with structured programs and expert guidance —
              anywhere you train.
            </p>
            <Button variant="accent" className="mt-6" asChild>
              <Link href={routes.register}>Create your account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-border bg-card py-16">
        <div className="container-app flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold">Talk to us</h2>
            <p className="mt-2 text-muted-foreground">
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="font-medium text-primary underline decoration-accent/60 underline-offset-4 hover:decoration-accent"
              >
                {siteConfig.contactEmail}
              </a>
              <span className="mx-2 text-border">·</span>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                {siteConfig.socialHandle}
              </a>
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={routes.login}>Sign in to dashboard</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
