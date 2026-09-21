import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  FileText,
  Shapes,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const featureCards = [
  {
    icon: CalendarDays,
    title: 'Plan with clarity',
    description: 'Bring assignments, focus sessions, and deadlines together.',
  },
  {
    icon: Shapes,
    title: 'Think out loud',
    description: 'Explore ideas on spacious collaborative whiteboards.',
  },
  {
    icon: FileText,
    title: 'Read deeply',
    description: 'Keep documents, notes, and progress close at hand.',
  },
];

function Storybook() {
  return (
    <motion.div
      className="relative mx-auto aspect-[4/3] w-full max-w-2xl [perspective:1400px]"
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-x-[5%] bottom-[7%] h-[12%] rounded-[50%] bg-black/20 blur-2xl" />
      <div className="absolute inset-[8%_2%_12%] [transform:rotateX(58deg)_rotateZ(-1deg)] [transform-style:preserve-3d]">
        <div className="bg-primary absolute inset-0 rounded-[1.4rem] shadow-book" />
        <div className="absolute inset-[2%] grid grid-cols-2 overflow-hidden rounded-xl [transform:translateZ(14px)]">
          <div className="relative border-r border-[#d8ceb9] bg-[#f5edda] p-[8%] text-[#283443]">
            <div className="absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-black/8 to-transparent" />
            <div className="mb-[8%] flex items-center gap-2 text-[clamp(8px,1.2vw,13px)] font-semibold">
              <span className="flex size-5 items-center justify-center rounded-md bg-[#b8ccb8]">
                <Check className="size-3" />
              </span>
              Today’s chapter
            </div>
            <div className="space-y-[5%]">
              {['Review biology notes', 'Essay outline', 'Study session'].map(
                (item, index) => (
                  <div
                    className="flex items-center gap-2 rounded-md bg-white/65 px-[5%] py-[4%] text-[clamp(6px,1vw,11px)] shadow-sm"
                    key={item}
                  >
                    <span
                      className={`size-2.5 rounded-full border ${index === 0 ? 'border-[#64806b] bg-[#8eac94]' : 'border-[#b9ae98]'}`}
                    />
                    {item}
                  </div>
                ),
              )}
            </div>
            <div className="absolute bottom-[9%] left-[12%] h-[30%] w-[12%] origin-bottom rounded-t-full bg-[#718d78] [transform:translateZ(32px)_rotateX(-42deg)]" />
            <div className="absolute bottom-[9%] left-[23%] h-[22%] w-[10%] origin-bottom rounded-t-full bg-[#d5ab70] [transform:translateZ(24px)_rotateX(-42deg)]" />
          </div>

          <div className="relative bg-[#fbf5e8] p-[8%] text-[#283443]">
            <div className="absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-black/9 to-transparent" />
            <div className="font-serif text-[clamp(11px,2vw,24px)] leading-tight">
              Make space
              <br />
              for wonder.
            </div>
            <div className="absolute right-[10%] bottom-[12%] left-[10%] h-[38%]">
              <div className="absolute inset-x-0 bottom-0 h-[28%] rounded-sm bg-[#c9d8d0] [transform:translateZ(18px)]" />
              <div className="absolute bottom-[18%] left-[12%] h-[52%] w-[18%] origin-bottom bg-[#d9a56e] [clip-path:polygon(50%_0,100%_100%,0_100%)] [transform:translateZ(44px)_rotateX(-38deg)]" />
              <div className="absolute bottom-[18%] left-[38%] h-[72%] w-[24%] origin-bottom bg-[#839baa] [clip-path:polygon(50%_0,100%_100%,0_100%)] [transform:translateZ(56px)_rotateX(-36deg)]" />
              <div className="absolute right-[8%] bottom-[18%] h-[45%] w-[18%] origin-bottom bg-[#a7b99d] [clip-path:polygon(50%_0,100%_100%,0_100%)] [transform:translateZ(36px)_rotateX(-40deg)]" />
              <Sparkles className="text-[#b88d42] absolute top-0 right-[5%] size-[12%] [transform:translateZ(70px)_rotateX(-48deg)]" />
            </div>
          </div>
        </div>
        <div className="absolute top-[3%] bottom-[3%] left-1/2 w-px bg-black/15 [transform:translateZ(17px)]" />
      </div>
    </motion.div>
  );
}

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pt-16 pb-24 sm:pt-24 lg:px-8 lg:pt-28">
        <div className="bg-secondary/60 absolute top-16 left-[8%] size-52 rounded-full blur-3xl" />
        <div className="bg-accent/20 absolute top-28 right-[8%] size-64 rounded-full blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge
              variant="outline"
              className="bg-background/65 mb-6 gap-2 py-1.5 backdrop-blur"
            >
              <Sparkles className="text-accent-foreground size-3.5" />
              A calmer way to study
            </Badge>
            <h1 className="text-balance font-serif text-5xl leading-[0.98] font-medium tracking-[-0.045em] sm:text-6xl xl:text-7xl">
              Your learning,
              <span className="text-muted-foreground italic"> beautifully </span>
              organized.
            </h1>
            <p className="text-muted-foreground mt-7 max-w-xl text-base leading-relaxed sm:text-lg">
              StudyVerse brings your plans, ideas, readings, and academic
              momentum into one thoughtful workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/register">
                  Begin your story <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/welcome">
                  <BookOpen />
                  Explore
                </Link>
              </Button>
            </div>
            <p className="text-muted-foreground mt-5 text-xs">
              Free to begin · Designed for focused minds
            </p>
          </motion.div>
          <Storybook />
        </div>
      </section>

      <section className="border-y bg-card/55 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
              One connected workspace
            </p>
            <h2 className="text-balance mt-4 font-serif text-4xl font-medium sm:text-5xl">
              Less time arranging. More time understanding.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-background/60 rounded-2xl border p-6 shadow-sm"
              >
                <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-xl">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-6 font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-5 py-8 lg:px-8">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} StudyVerse</span>
          <span>Built for the quiet joy of learning.</span>
        </div>
      </footer>
    </>
  );
}
