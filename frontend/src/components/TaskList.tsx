import { useState } from "react";
import type { Task, ViewId } from "../types";

interface Props {
  view: ViewId;
  viewTitle: string;
  tasks: Task[];
  onAddTask: (title: string) => void;
  onToggleDone: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onOpenTask: (id: string) => void;
}

export default function TaskListPanel({
  view,
  viewTitle,
  tasks,
  onAddTask,
  onToggleDone,
  onToggleImportant,
  onOpenTask,
}: Props) {
  const [draft, setDraft] = useState("");

  function submit() {
    const title = draft.trim();
    if (!title) return;
    onAddTask(title);
    setDraft("");
  }

  const active = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="task-panel">
      <div className="task-header">
        <h1>{viewTitle}</h1>
        {view === "myday" && (
          <div className="meta">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
        )}
      </div>

      <div className="add-task-row">
        <div className="plus" onClick={submit}>
          ＋
        </div>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a task"
        />
      </div>

      <div className="task-list">
        {active.length === 0 && done.length === 0 && (
          <div className="empty-state">
            Nothing here yet.
            <br />
            Add a task above to get started.
          </div>
        )}
        {active.map((t) => (
          <TaskRow key={t.id} task={t} onToggleDone={onToggleDone} onToggleImportant={onToggleImportant} onOpen={onOpenTask} />
        ))}
        {done.length > 0 && <div className="task-group-label">Completed ({done.length})</div>}
        {done.map((t) => (
          <TaskRow key={t.id} task={t} onToggleDone={onToggleDone} onToggleImportant={onToggleImportant} onOpen={onOpenTask} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onToggleDone,
  onToggleImportant,
  onOpen,
}: {
  task: Task;
  onToggleDone: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const subParts: string[] = [];
  if (task.due_date) subParts.push(`Due ${task.due_date}`);
  if (task.steps.length) subParts.push(`${task.steps.filter((s) => s.done).length}/${task.steps.length} steps`);

  return (
    <div className={`task-row${task.completed ? " completed" : ""}`} onClick={() => onOpen(task.id)}>
      <div
        className={`check${task.completed ? " done" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone(task.id);
        }}
      >
        {task.completed ? "✓" : ""}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="task-title">{task.title}</div>
        {subParts.length > 0 && <div className="task-sub">{subParts.join(" · ")}</div>}
      </div>
      <div
        className={`star${task.important ? " on" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleImportant(task.id);
        }}
      >
        ★
      </div>
    </div>
  );
}
