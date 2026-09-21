import { useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  CalendarDays,
  FilePenLine,
  ListChecks,
  MousePointer2,
  NotebookPen,
  Shapes,
  type LucideIcon,
} from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Link } from 'react-router-dom';

import { BookPage } from '@/features/welcome/storybook/book-page';
import {
  CalendarPreview,
  DocumentPreview,
  LibraryPreview,
  NotebookPreview,
  TaskPreview,
  WhiteboardPreview,
} from '@/features/welcome/storybook/feature-visuals';
import { cn } from '@/lib/utils';

import './storybook.css';

type PageFlipApi = {
  flip: (page: number, corner: 'top' | 'bottom') => void;
  flipNext: (corner: 'top' | 'bottom') => void;
  flipPrev: (corner: 'top' | 'bottom') => void;
};

type FlipBookHandle = {
  pageFlip: () => PageFlipApi;
};

type Chapter = {
  label: string;
  title: string;
  shortTitle: string;
  description: string;
  route: string;
  icon: LucideIcon;
};

const chapters: Chapter[] = [
  {
    label: 'Chapter one',
    shortTitle: 'Tasks',
    title: 'Organize your study life.',
    description:
      'Turn assignments into a calm, clear sequence of next steps—with priorities, subjects, and progress that stay easy to understand.',
    route: '/tasks',
    icon: ListChecks,
  },
  {
    label: 'Chapter two',
    shortTitle: 'Calendar',
    title: 'See what is coming.',
    description:
      'Bring classes, study sessions, and important deadlines into one academic rhythm you can trust.',
    route: '/calendar',
    icon: CalendarDays,
  },
  {
    label: 'Chapter three',
    shortTitle: 'Whiteboard',
    title: 'Think visually. Create together.',
    description:
      'Give early ideas room to move. Map concepts, sketch connections, and invite others into the same infinite canvas.',
    route: '/whiteboards',
    icon: Shapes,
  },
  {
    label: 'Chapter four',
    shortTitle: 'PDF reader',
    title: 'Read actively, not passively.',
    description:
      'Keep the text, your highlights, and the questions in the margin together—exactly where learning happens.',
    route: '/documents',
    icon: FilePenLine,
  },
  {
    label: 'Chapter five',
    shortTitle: 'Library',
    title: 'Keep your knowledge close.',
    description:
      'Build a personal library that remembers what matters, where you paused, and what you want to revisit.',
    route: '/library',
    icon: BookMarked,
  },
  {
    label: 'Chapter six',
    shortTitle: 'Notebooks',
    title: 'Keep a notebook beside you.',
    description:
      'Choose lined, grid, dotted, or blank paper. Write on the page, or turn it over and draw.',
    route: '/notebooks',
    icon: NotebookPen,
  },
];

function ChapterPage({ chapter }: { chapter: Chapter }) {
  const Icon = chapter.icon;

  return (
    <div className="chapter-page">
      <span className="chapter-page__number">{chapter.label}</span>
      <div className="chapter-page__icon">
        <Icon />
      </div>
      <h3>{chapter.title}</h3>
      <p>{chapter.description}</p>
      <Link
        to={chapter.route}
        className="chapter-page__link"
        onPointerDown={(event) => event.stopPropagation()}
      >
        Enter this space
        <ArrowRight />
      </Link>
      <blockquote>
        “The beautiful thing about learning is that no one can take it away
        from you.”
      </blockquote>
    </div>
  );
}

export function InteractiveStorybook() {
  const bookRef = useRef<FlipBookHandle | null>(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const currentChapter = chapters[currentSpread] ?? chapters[0];

  const turnTo = (spread: number) => {
    if (spread < 0 || spread >= chapters.length) return;
    bookRef.current?.pageFlip().flip(spread * 2, 'top');
  };

  const turnPrevious = () => {
    bookRef.current?.pageFlip().flipPrev('top');
  };

  const turnNext = () => {
    bookRef.current?.pageFlip().flipNext('top');
  };

  const handleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      turnPrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      turnNext();
    }
  };

  return (
    <section className="interactive-book" aria-labelledby="storybook-title">
      <div className="interactive-book__heading">
        <div>
          <span className="interactive-book__eyebrow">
            An interactive tour
          </span>
          <h2 id="storybook-title">Turn the page. Discover your workspace.</h2>
        </div>
        <p>
          Drag a page corner, swipe, or use the controls. Every spread opens a
          different part of StudyVerse.
        </p>
      </div>

      <div
        className="book-stage"
        tabIndex={0}
        onKeyDown={handleKeys}
        aria-label={`Interactive StudyVerse book. Current spread: ${currentChapter.shortTitle}`}
      >
        <div className="book-stage__shadow" />
        <div className="book-stage__cover" />
        <HTMLFlipBook
          ref={bookRef}
          className="study-book"
          style={{}}
          width={520}
          height={640}
          size="stretch"
          minWidth={150}
          maxWidth={560}
          minHeight={220}
          maxHeight={690}
          startPage={0}
          drawShadow
          flippingTime={prefersReducedMotion ? 350 : 1100}
          usePortrait={false}
          startZIndex={10}
          autoSize
          maxShadowOpacity={0.42}
          showCover={false}
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={24}
          showPageCorners={!prefersReducedMotion}
          disableFlipByClick
          onFlip={(event: { data: number }) => {
            setCurrentSpread(
              Math.min(
                chapters.length - 1,
                Math.max(0, Math.floor(event.data / 2)),
              ),
            );
          }}
        >
          <BookPage side="left" pageNumber={1} tone="sage">
            <ChapterPage chapter={chapters[0]} />
          </BookPage>
          <BookPage side="right" pageNumber={2} tone="sage">
            <TaskPreview />
          </BookPage>

          <BookPage side="left" pageNumber={3} tone="blue">
            <ChapterPage chapter={chapters[1]} />
          </BookPage>
          <BookPage side="right" pageNumber={4} tone="blue">
            <CalendarPreview />
          </BookPage>

          <BookPage side="left" pageNumber={5} tone="gold">
            <ChapterPage chapter={chapters[2]} />
          </BookPage>
          <BookPage side="right" pageNumber={6} tone="gold">
            <WhiteboardPreview />
          </BookPage>

          <BookPage side="left" pageNumber={7} tone="rose">
            <ChapterPage chapter={chapters[3]} />
          </BookPage>
          <BookPage side="right" pageNumber={8} tone="rose">
            <DocumentPreview />
          </BookPage>

          <BookPage side="left" pageNumber={9} tone="ink">
            <ChapterPage chapter={chapters[4]} />
          </BookPage>
          <BookPage side="right" pageNumber={10} tone="ink">
            <LibraryPreview />
          </BookPage>

          <BookPage side="left" pageNumber={11} tone="sage">
            <ChapterPage chapter={chapters[5]} />
          </BookPage>
          <BookPage side="right" pageNumber={12} tone="sage">
            <NotebookPreview />
          </BookPage>
        </HTMLFlipBook>
        <div className="book-stage__spine" aria-hidden="true" />
      </div>

      <div className="book-navigation">
        <button
          type="button"
          className="book-navigation__arrow"
          onClick={turnPrevious}
          disabled={currentSpread === 0}
          aria-label="Turn to the previous spread"
        >
          <ArrowLeft />
        </button>

        <div className="book-navigation__chapters" aria-label="Book chapters">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.shortTitle}
              type="button"
              className={cn(
                'book-navigation__chapter',
                currentSpread === index && 'is-active',
              )}
              onClick={() => turnTo(index)}
              aria-current={currentSpread === index ? 'step' : undefined}
              aria-label={`Open ${chapter.shortTitle} spread`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {chapter.shortTitle}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="book-navigation__arrow"
          onClick={turnNext}
          disabled={currentSpread === chapters.length - 1}
          aria-label="Turn to the next spread"
        >
          <ArrowRight />
        </button>
      </div>

      <div className="book-interaction-hint" aria-hidden="true">
        <MousePointer2 />
        Drag the outer page corner to turn
      </div>
    </section>
  );
}
