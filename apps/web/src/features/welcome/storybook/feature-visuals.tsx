import {
  BookMarked,
  Check,
  Circle,
  FileText,
  Highlighter,
  MessageSquareText,
  MousePointer2,
  PenLine,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import { useState } from 'react';

const taskItems = [
  { id: 1, label: 'Review cell biology', meta: 'Biology · Today' },
  { id: 2, label: 'Outline literature essay', meta: 'English · 4:00 PM' },
  { id: 3, label: 'Practice derivatives', meta: 'Calculus · Tomorrow' },
];

export function TaskPreview() {
  const [completed, setCompleted] = useState<number[]>([1]);

  const toggleTask = (id: number) => {
    setCompleted((current) =>
      current.includes(id)
        ? current.filter((taskId) => taskId !== id)
        : [...current, id],
    );
  };

  return (
    <div className="page-visual page-visual--tasks">
      <div className="page-visual__topline">
        <div>
          <span className="page-kicker">Today</span>
          <h3>Your next chapter</h3>
        </div>
        <span className="progress-orb">{completed.length}/3</span>
      </div>
      <div className="task-preview-list">
        {taskItems.map((task) => {
          const isCompleted = completed.includes(task.id);
          return (
            <button
              key={task.id}
              type="button"
              className="task-preview-item"
              aria-pressed={isCompleted}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => toggleTask(task.id)}
            >
              <span
                className="task-preview-check"
                data-completed={isCompleted}
              >
                {isCompleted ? <Check /> : <Circle />}
              </span>
              <span>
                <strong data-completed={isCompleted}>{task.label}</strong>
                <small>{task.meta}</small>
              </span>
            </button>
          );
        })}
      </div>
      <div className="paper-note">
        <Sparkles />
        Small steps become steady progress.
      </div>
    </div>
  );
}

const calendarDays = [
  27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
  18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
];

export function CalendarPreview() {
  const [selectedDay, setSelectedDay] = useState(14);

  return (
    <div className="page-visual page-visual--calendar">
      <div className="calendar-heading">
        <div>
          <span className="page-kicker">October</span>
          <h3>Semester rhythm</h3>
        </div>
        <span className="calendar-year">2026</span>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid" aria-label="October calendar preview">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = index >= 4;
          const hasEvent = [7, 14, 21, 27].includes(day) && isCurrentMonth;
          return (
            <button
              key={`${day}-${index}`}
              type="button"
              className="calendar-day"
              data-muted={!isCurrentMonth}
              data-selected={isCurrentMonth && selectedDay === day}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => isCurrentMonth && setSelectedDay(day)}
              aria-label={`Select October ${day}`}
            >
              {day}
              {hasEvent && <span />}
            </button>
          );
        })}
      </div>
      <div className="calendar-event-card">
        <span className="event-color" />
        <div>
          <strong>Research presentation</strong>
          <small>October {selectedDay} · 10:30 AM</small>
        </div>
      </div>
    </div>
  );
}

export function WhiteboardPreview() {
  return (
    <div className="page-visual page-visual--board">
      <div className="board-toolbar">
        <MousePointer2 />
        <PenLine />
        <StickyNote />
        <span />
        <small>2 collaborators</small>
      </div>
      <div className="board-canvas">
        <div className="board-node board-node--question">How do ideas grow?</div>
        <div className="board-line board-line--one" />
        <div className="board-line board-line--two" />
        <div className="board-node board-node--research">Research</div>
        <div className="board-node board-node--connect">Connect</div>
        <div className="board-sticky">
          <StickyNote />
          Ask better questions
        </div>
        <div className="collaborator-cursor collaborator-cursor--one">
          <MousePointer2 />
          <span>Maya</span>
        </div>
        <div className="collaborator-cursor collaborator-cursor--two">
          <MousePointer2 />
          <span>Alex</span>
        </div>
      </div>
    </div>
  );
}

export function DocumentPreview() {
  return (
    <div className="page-visual page-visual--document">
      <div className="document-toolbar">
        <FileText />
        <span>Learning & Memory.pdf</span>
        <strong>12 / 36</strong>
      </div>
      <div className="document-sheet">
        <span className="page-kicker">Chapter III</span>
        <h3>How knowledge takes root</h3>
        <p>
          Active recall strengthens the pathways that make new information
          easier to retrieve.
        </p>
        <p className="document-highlight">
          Meaningful connections turn isolated facts into lasting knowledge.
        </p>
        <p>
          Reflection and spaced practice give those connections time to grow.
        </p>
        <div className="margin-note">
          <MessageSquareText />
          Connect this to the lecture notes.
        </div>
      </div>
      <div className="annotation-tools" aria-hidden="true">
        <Highlighter />
        <PenLine />
        <MessageSquareText />
      </div>
    </div>
  );
}

export function LibraryPreview() {
  return (
    <div className="page-visual page-visual--library">
      <div className="library-heading">
        <div>
          <span className="page-kicker">Your collection</span>
          <h3>A library that remembers</h3>
        </div>
        <BookMarked />
      </div>
      <div className="book-shelf">
        <article className="mini-book mini-book--sage">
          <span>Biology</span>
          <strong>The Living World</strong>
          <small>68% read</small>
        </article>
        <article className="mini-book mini-book--blue">
          <span>Philosophy</span>
          <strong>Ways of Knowing</strong>
          <small>Chapter 4</small>
        </article>
        <article className="mini-book mini-book--gold">
          <span>Design</span>
          <strong>Visual Thinking</strong>
          <small>New</small>
        </article>
      </div>
      <div className="shelf-line" />
      <div className="library-memory">
        <span>Continue reading</span>
        <strong>Page 142 — The Living World</strong>
      </div>
    </div>
  );
}
