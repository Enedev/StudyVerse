import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookMarked,
  CalendarCheck,
  FilePenLine,
  ListChecks,
  NotebookPen,
  Shapes,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

const chapters = [
  {
    number: '01',
    icon: ListChecks,
    title: 'Organize your study life.',
    description:
      'Turn every assignment, idea, and next step into a clear path forward.',
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Never miss an important deadline.',
    description:
      'See your academic rhythm unfold across days, weeks, and semesters.',
  },
  {
    number: '03',
    icon: Shapes,
    title: 'Think visually. Create together.',
    description:
      'Shape rough thoughts into shared maps, diagrams, and discoveries.',
  },
  {
    number: '04',
    icon: FilePenLine,
    title: 'Read. Annotate. Learn.',
    description:
      'Make every document an active part of how you understand and remember.',
  },
  {
    number: '05',
    icon: BookMarked,
    title: 'Keep your knowledge with you.',
    description:
      'Build a personal library that grows alongside your curiosity.',
  },
  {
    number: '06',
    icon: NotebookPen,
    title: 'Open a notebook and begin.',
    description:
      'Pick the paper, write across the lines, or draw when the idea needs more than words.',
  },
];

export function WelcomePage() {
  return (
    <main>
      <section className="px-5 py-20 text-center sm:py-28 lg:px-8">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
          The StudyVerse story
        </p>
        <h1 className="text-balance mx-auto mt-5 max-w-4xl font-serif text-5xl font-medium tracking-tight sm:text-7xl">
          Open a new chapter in how you learn.
        </h1>
        <p className="text-muted-foreground mx-auto mt-7 max-w-2xl leading-relaxed">
          Six connected spaces, designed to feel like one calm and intuitive
          academic home.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 lg:px-8">
        <div className="relative">
          <div className="bg-border absolute top-8 bottom-8 left-8 hidden w-px md:block" />
          {chapters.map(
            ({ number, icon: Icon, title, description }, index) => (
              <motion.article
                key={number}
                className="relative grid gap-5 border-b py-10 last:border-0 md:grid-cols-[4rem_1fr_1fr] md:gap-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: index * 0.04 }}
              >
                <div className="bg-background relative z-10 flex size-16 items-center justify-center rounded-full border shadow-sm">
                  <Icon className="text-primary size-6" />
                </div>
                <div>
                  <span className="text-muted-foreground text-xs tracking-widest">
                    CHAPTER {number}
                  </span>
                  <h2 className="mt-3 font-serif text-3xl font-medium">
                    {title}
                  </h2>
                </div>
                <p className="text-muted-foreground self-center leading-relaxed">
                  {description}
                </p>
              </motion.article>
            ),
          )}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground px-5 py-20 text-center lg:px-8">
        <h2 className="text-balance mx-auto max-w-3xl font-serif text-4xl font-medium sm:text-6xl">
          Everything you need to learn. One beautiful workspace.
        </h2>
        <Button
          className="mt-9 bg-white text-slate-900 hover:bg-white/90"
          size="lg"
          asChild
        >
          <Link to="/register">
            Get started <ArrowRight />
          </Link>
        </Button>
      </section>
    </main>
  );
}
