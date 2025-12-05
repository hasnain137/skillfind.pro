// src/components/landing/HowItWorks.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Create a request",
    description: "Tell us what you need, your budget, and delivery preference. It's free and takes 2 minutes.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    number: "2",
    title: "Receive custom offers",
    description: "Verified professionals will review your request and send tailored offers with price and availability.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )
  },
  {
    number: "3",
    title: "Hire & leave a review",
    description: "Choose the best fit, chat directly, and get the job done. Leave a review to help the community.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-24 bg-white border-b border-slate-200">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Simple & Transparent
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#333333] md:text-4xl">
            How SkillFind works.
          </h2>
          <p className="mt-4 text-lg text-[#7C7373] max-w-2xl mx-auto">
            Get the job done in three easy steps. No hidden fees, no hassle.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 + 0.3 }}
              className="relative group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-3">{step.title}</h3>
              <p className="text-[#7C7373] leading-relaxed text-sm">
                {step.description}
              </p>

              {/* Step number watermark */}
              <div className="absolute top-4 right-6 text-6xl font-black text-slate-50/80 -z-0 select-none pointer-events-none">
                {step.number}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
