import { useState } from "react";
import type {
  Task,
  ViewId,
} from "../types";

interface Props {
  view: ViewId;
  viewTitle: string;
  tasks: Task[];

  onAddTask: (
    title: string
  ) => void;

  onToggleDone: (
    id: string
  ) => void;

  onToggleImportant: (
    id: string
  ) => void;

  onOpenTask: (
    id: string
  ) => void;
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
  const [draft, setDraft] =
    useState("");

  function submit() {
    const title = draft.trim();

    if (!title) return;

    // Clear immediately
    setDraft("");

    // Task appears immediately
    onAddTask(title);
  }

  const active = tasks.filter(
    (task) =>
      !task.completed
  );

  const done = tasks.filter(
    (task) =>
      task.completed
  );

  return (
    <div className="task-panel">
      {/* HEADER */}
      <div className="task-header">
        <h1>
          {viewTitle}
        </h1>

        {view === "myday" && (
          <div className="meta">
            {new Date().toLocaleDateString(
              undefined,
              {
                weekday:
                  "long",
                month: "long",
                day: "numeric",
              }
            )}
          </div>
        )}
      </div>

      {/* ADD TASK */}
      <div className="add-task-row">
        <div
          className="plus"
          onClick={submit}
        >
          ＋
        </div>

        <input
          value={draft}
          onChange={(e) =>
            setDraft(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter"
            ) {
              submit();
            }
          }}
          placeholder="Add a task"
        />
      </div>

      {/* TASKS */}
      <div className="task-list">
        {active.length === 0 &&
          done.length === 0 && (
            <div className="empty-state">
              Nothing here yet.
              <br />
              Add a task above
              to get started.
            </div>
          )}

        {active.map(
          (task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleDone={
                onToggleDone
              }
              onToggleImportant={
                onToggleImportant
              }
              onOpen={
                onOpenTask
              }
            />
          )
        )}

        {done.length > 0 && (
          <div className="task-group-label">
            Completed (
            {done.length})
          </div>
        )}

        {done.map(
          (task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleDone={
                onToggleDone
              }
              onToggleImportant={
                onToggleImportant
              }
              onOpen={
                onOpenTask
              }
            />
          )
        )}
      </div>
    </div>
  );
}

function formatTime(
  value: string | null
) {
  if (!value) return "";

  const [hour, minute] =
    value
      .slice(0, 5)
      .split(":")
      .map(Number);

  const date = new Date();

  date.setHours(
    hour,
    minute,
    0,
    0
  );

  return date.toLocaleTimeString(
    [],
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function TaskRow({
  task,
  onToggleDone,
  onToggleImportant,
  onOpen,
}: {
  task: Task;

  onToggleDone: (
    id: string
  ) => void;

  onToggleImportant: (
    id: string
  ) => void;

  onOpen: (
    id: string
  ) => void;
}) {
  const subParts: string[] =
    [];

  const isSaving =
    task.id.startsWith(
      "temp-"
    );

  if (task.due_date) {
    subParts.push(
      `Due ${task.due_date}`
    );
  }

  if (
    task.steps.length
  ) {
    const completedSteps =
      task.steps.filter(
        (step) =>
          step.done
      ).length;

    subParts.push(
      `${completedSteps}/${task.steps.length} steps`
    );
  }

  if (isSaving) {
    subParts.push(
      "Saving..."
    );
  }

  const startTime =
    formatTime(
      task.start_time
    );

  const endTime =
    formatTime(
      task.end_time
    );

  let timeText = "";

  if (
    startTime &&
    endTime
  ) {
    timeText =
      `${startTime} – ${endTime}`;
  } else if (startTime) {
    timeText =
      startTime;
  } else if (endTime) {
    timeText =
      endTime;
  }

  return (
    <div
      className={`task-row${
        task.completed
          ? " completed"
          : ""
      }`}
      onClick={() => {
        // Do not open temporary task
        // until backend creates it
        if (!isSaving) {
          onOpen(task.id);
        }
      }}
    >
      {/* COMPLETE */}
      <div
        className={`check${
          task.completed
            ? " done"
            : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();

          if (!isSaving) {
            onToggleDone(
              task.id
            );
          }
        }}
      >
        {task.completed
          ? "✓"
          : ""}
      </div>

      {/* TITLE */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div className="task-title">
          {task.title}
        </div>

        {subParts.length >
          0 && (
          <div className="task-sub">
            {subParts.join(
              " · "
            )}
          </div>
        )}
      </div>

      {/* TIME */}
      {timeText && (
        <div className="task-time">
          {timeText}
        </div>
      )}

      {/* IMPORTANT */}
      <div
        className={`star${
          task.important
            ? " on"
            : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();

          if (!isSaving) {
            onToggleImportant(
              task.id
            );
          }
        }}
      >
        ★
      </div>
    </div>
  );
}