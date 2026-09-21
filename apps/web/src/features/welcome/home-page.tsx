import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InteractiveStorybook } from '@/features/welcome/storybook/interactive-storybook';

export function HomePage() {
  return (
    <>
      <main className="relative overflow-hidden">
        <div className="bg-secondary/55 absolute top-20 left-[5%] size-64 rounded-full blur-3xl" />
        <div className="bg-accent/18 absolute top-40 right-[4%] size-72 rounded-full blur-3xl" />

        <section className="relative px-4 pt-16 pb-24 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge
              variant="outline"
              className="bg-background/65 mb-6 gap-2 py-1.5 backdrop-blur"
            >
              <Sparkles className="text-accent-foreground size-3.5" />
              Your academic world, in one living book
            </Badge>
            <h1 className="text-balance font-serif text-5xl leading-[0.96] font-medium tracking-[-0.05em] sm:text-6xl lg:text-7xl xl:text-8xl">
              Turn the page.
              <span className="text-muted-foreground block italic">
                Discover how you learn.
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-7 max-w-2xl text-base leading-relaxed sm:text-lg">
              Explore StudyVerse as a real interactive book. Each page opens a
              new space for planning, thinking, reading, and remembering.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/register">
                  Begin your story <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#interactive-book">
                  <BookOpen />
                  Open the book
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            id="interactive-book"
            className="mx-auto mt-20 max-w-[90rem] scroll-mt-24"
            initial={{ opacity: 0, y: 36, rotateX: 4 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <InteractiveStorybook />
          </motion.div>
        </section>

        <section className="bg-primary text-primary-foreground relative overflow-hidden px-5 py-20 text-center lg:px-8">
          <div className="absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full border border-white/10" />
          <div className="relative">
            <p className="text-accent text-xs font-semibold tracking-[0.22em] uppercase">
              Your next chapter
            </p>
            <h2 className="text-balance mx-auto mt-4 max-w-3xl font-serif text-4xl font-medium sm:text-6xl">
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
          </div>
        </section>
      </main>

      <footer className="px-5 py-8 lg:px-8">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} StudyVerse</span>
          <span>Built for the quiet joy of learning.</span>
        </div>
      </footer>
    </>
  );
}
