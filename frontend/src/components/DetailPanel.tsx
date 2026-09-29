import { useEffect, useState } from "react";
import type {
  Task,
  TaskList,
  TaskUpdatePayload,
} from "../types";

interface Props {
  task: Task;
  lists: TaskList[];

  onClose: () => void;

  onUpdate: (
    patch: TaskUpdatePayload
  ) => Promise<boolean>;

  onToggleDone: () => void;
  onDelete: () => void;

  onAddStep: (text: string) => void;
  onToggleStep: (stepId: string) => void;

  onRenameStep: (
    stepId: string,
    text: string
  ) => void;

  onRemoveStep: (stepId: string) => void;
}

function todayStr() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function DetailPanel({
  task,
  lists,
  onClose,
  onUpdate,
  onToggleDone,
  onDelete,
  onAddStep,
  onToggleStep,
  onRenameStep,
  onRemoveStep,
}: Props) {
  const [newStep, setNewStep] =
    useState("");

  // TASK TITLE EDITING
  const [editingTitle, setEditingTitle] =
    useState(false);

  const [titleDraft, setTitleDraft] =
    useState(task.title);

  const [savingTitle, setSavingTitle] =
    useState(false);

  // NOTES
  const [notesDraft, setNotesDraft] =
    useState(task.notes || "");

  const isMyDay =
    task.my_day_date === todayStr();

  // Reset local fields when another task is opened
  useEffect(() => {
    setTitleDraft(task.title);
    setNotesDraft(task.notes || "");
    setEditingTitle(false);
  }, [task.id, task.title, task.notes]);

  function submitStep() {
    const text = newStep.trim();

    if (!text) return;

    onAddStep(text);

    setNewStep("");
  }

  async function saveTitle() {
    const title = titleDraft.trim();

    if (!title) {
      alert("Task name cannot be empty.");
      return;
    }

    if (title === task.title) {
      setEditingTitle(false);
      return;
    }

    setSavingTitle(true);

    const success = await onUpdate({
      title,
    });

    setSavingTitle(false);

    if (success) {
      setEditingTitle(false);
    }
  }

  async function saveNotes() {
    if (notesDraft === task.notes) {
      return;
    }

    await onUpdate({
      notes: notesDraft,
    });
  }

  return (
    <div className="detail open">
      {/* TOP */}
      <div className="detail-top">
        <div
          className={`check${
            task.completed
              ? " done"
              : ""
          }`}
          onClick={onToggleDone}
        >
          {task.completed ? "✓" : ""}
        </div>

        {/* TITLE */}
        {editingTitle ? (
          <div className="title-edit-area">
            <input
              className="dtitle"
              value={titleDraft}
              autoFocus
              onChange={(e) =>
                setTitleDraft(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  saveTitle();
                }

                if (
                  e.key === "Escape"
                ) {
                  setTitleDraft(
                    task.title
                  );

                  setEditingTitle(
                    false
                  );
                }
              }}
            />

            <button
              className="title-save-btn"
              onClick={saveTitle}
              disabled={savingTitle}
            >
              {savingTitle
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        ) : (
          <>
            <div className="dtitle-text">
              {task.title}
            </div>

            <button
              className="title-edit-btn"
              onClick={() => {
                setTitleDraft(
                  task.title
                );

                setEditingTitle(
                  true
                );
              }}
            >
              ✎ Edit
            </button>
          </>
        )}

        <button
          className="close-detail"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className="detail-body">
        {/* IMPORTANT / MY DAY */}
        <div className="d-section">
          <div
            className="d-row"
            onClick={() =>
              onUpdate({
                important:
                  !task.important,
              })
            }
          >
            <span className="ic">
              ★
            </span>

            <label>
              {task.important
                ? "Marked as important"
                : "Mark as important"}
            </label>
          </div>

          <div
            className="d-row"
            onClick={() =>
              onUpdate({
                my_day:
                  !isMyDay,
              })
            }
          >
            <span className="ic">
              ☀
            </span>

            <label>
              {isMyDay
                ? "Added to My Day"
                : "Add to My Day"}
            </label>
          </div>
        </div>

        {/* DATE / TIME */}
        <div className="d-section">
          {/* DUE DATE */}
          <div className="d-row">
            <span className="ic">
              📅
            </span>

            <label>Due</label>

            <input
              type="date"
              value={
                task.due_date || ""
              }
              onChange={(e) =>
                onUpdate({
                  due_date:
                    e.target.value ||
                    null,
                })
              }
            />
          </div>

          {/* START TIME */}
          <div className="d-row">
            <span className="ic">
              🕐
            </span>

            <label>
              Start time
            </label>

            <input
              type="time"
              value={
                task.start_time
                  ? task.start_time.slice(
                      0,
                      5
                    )
                  : ""
              }
              onChange={(e) =>
                onUpdate({
                  start_time:
                    e.target.value ||
                    null,
                })
              }
            />
          </div>

          {/* END TIME */}
          <div className="d-row">
            <span className="ic">
              🕑
            </span>

            <label>
              End time
            </label>

            <input
              type="time"
              value={
                task.end_time
                  ? task.end_time.slice(
                      0,
                      5
                    )
                  : ""
              }
              onChange={(e) =>
                onUpdate({
                  end_time:
                    e.target.value ||
                    null,
                })
              }
            />
          </div>

          {/* REMINDER */}
          <div className="d-row">
            <span className="ic">
              ⏰
            </span>

            <label>
              Remind me
            </label>

            <input
              type="datetime-local"
              value={
                task.reminder
                  ? task.reminder.slice(
                      0,
                      16
                    )
                  : ""
              }
              onChange={(e) =>
                onUpdate({
                  reminder:
                    e.target.value ||
                    null,
                })
              }
            />
          </div>

          {/* REPEAT */}
          <div className="d-row">
            <span className="ic">
              ↻
            </span>

            <label>Repeat</label>

            <select
              value={
                task.repeat || ""
              }
              onChange={(e) =>
                onUpdate({
                  repeat:
                    e.target
                      .value as
                      | "daily"
                      | "weekly"
                      | "monthly"
                      | "",
                })
              }
            >
              <option value="">
                None
              </option>

              <option value="daily">
                Daily
              </option>

              <option value="weekly">
                Weekly
              </option>

              <option value="monthly">
                Monthly
              </option>
            </select>
          </div>

          {/* LIST */}
          <div className="d-row">
            <span className="ic">
              ▤
            </span>

            <label>List</label>

            <select
              value={task.list_id}
              onChange={(e) =>
                onUpdate({
                  list_id:
                    e.target.value,
                })
              }
            >
              {lists.map(
                (list) => (
                  <option
                    key={list.id}
                    value={list.id}
                  >
                    {list.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* STEPS */}
        <div className="d-section">
          <div
            className="lists-head"
            style={{
              padding: "0 8px",
            }}
          >
            Steps
          </div>

          <div className="steps-list">
            {task.steps.map(
              (step) => (
                <div
                  key={step.id}
                  className={`step-row${
                    step.done
                      ? " done"
                      : ""
                  }`}
                >
                  <div
                    className={`check${
                      step.done
                        ? " done"
                        : ""
                    }`}
                    style={{
                      width: 16,
                      height: 16,
                      fontSize: 9,
                    }}
                    onClick={() =>
                      onToggleStep(
                        step.id
                      )
                    }
                  >
                    {step.done
                      ? "✓"
                      : ""}
                  </div>

                  <input
                    type="text"
                    value={
                      step.text
                    }
                    onChange={(e) =>
                      onRenameStep(
                        step.id,
                        e.target.value
                      )
                    }
                  />

                  <span
                    className="close-detail"
                    style={{
                      fontSize: 13,
                    }}
                    onClick={() =>
                      onRemoveStep(
                        step.id
                      )
                    }
                  >
                    ✕
                  </span>
                </div>
              )
            )}
          </div>

          {/* ADD STEP */}
          <div
            className="add-step"
            onClick={submitStep}
          >
            <span className="ic">
              ＋
            </span>

            <input
              type="text"
              value={newStep}
              onChange={(e) =>
                setNewStep(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  submitStep();
                }
              }}
              placeholder="Add step"
              style={{
                background:
                  "transparent",
                border: "none",
                flex: 1,
                color: "inherit",
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            />
          </div>
        </div>

        {/* NOTES */}
        <div className="d-section">
          <div
            className="lists-head"
            style={{
              padding: "0 8px",
            }}
          >
            Notes
          </div>

          <textarea
            className="dnotes"
            value={notesDraft}
            onChange={(e) =>
              setNotesDraft(
                e.target.value
              )
            }
            onBlur={saveNotes}
            placeholder="Add notes..."
          />
        </div>

        {/* CREATED */}
        <div className="d-meta">
          Created{" "}
          {new Date(
            task.created_at
          ).toLocaleDateString()}
        </div>

        {/* DELETE */}
        <div
          className="d-delete"
          onClick={onDelete}
        >
          <span className="ic">
            🗑
          </span>

          Delete task
        </div>
      </div>
    </div>
  );
}