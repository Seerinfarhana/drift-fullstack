import { useState } from "react";
import type { Task, TaskList, TaskUpdatePayload } from "../types";

interface Props {
  task: Task;
  lists: TaskList[];
  onClose: () => void;
  onUpdate: (patch: TaskUpdatePayload) => void;
  onToggleDone: () => void;
  onDelete: () => void;
  onAddStep: (text: string) => void;
  onToggleStep: (stepId: string) => void;
  onRenameStep: (stepId: string, text: string) => void;
  onRemoveStep: (stepId: string) => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

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
  const [newStep, setNewStep] = useState("");
  const isMyDay = task.my_day_date === todayStr();

  function submitStep() {
    const text = newStep.trim();
    if (!text) return;
    onAddStep(text);
    setNewStep("");
  }

  return (
    <div className="detail open">
      <div className="detail-top">
        <div className={`check${task.completed ? " done" : ""}`} onClick={onToggleDone}>
          {task.completed ? "✓" : ""}
        </div>
        <input className="dtitle" value={task.title} onChange={(e) => onUpdate({ title: e.target.value })} />
        <button className="close-detail" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="detail-body">
        <div className="d-section">
          <div className="d-row" onClick={() => onUpdate({ important: !task.important })}>
            <span className="ic">★</span>
            <label>{task.important ? "Marked as important" : "Mark as important"}</label>
          </div>
          <div className="d-row" onClick={() => onUpdate({ my_day: !isMyDay })}>
            <span className="ic">☀</span>
            <label>{isMyDay ? "Added to My Day" : "Add to My Day"}</label>
          </div>
        </div>

        <div className="d-section">
          <div className="d-row">
            <span className="ic">📅</span>
            <label>Due</label>
            <input
              type="date"
              value={task.due_date || ""}
              onChange={(e) => onUpdate({ due_date: e.target.value || null })}
            />
          </div>
          <div className="d-row">
            <span className="ic">⏰</span>
            <label>Remind me</label>
            <input
              type="datetime-local"
              value={task.reminder ? task.reminder.slice(0, 16) : ""}
              onChange={(e) => onUpdate({ reminder: e.target.value || null })}
            />
          </div>
          <div className="d-row">
            <span className="ic">↻</span>
            <label>Repeat</label>
            <select value={task.repeat || ""} onChange={(e) => onUpdate({ repeat: e.target.value as any })}>
              <option value="">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="d-row">
            <span className="ic">▤</span>
            <label>List</label>
            <select value={task.list_id} onChange={(e) => onUpdate({ list_id: e.target.value })}>
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-section">
          <div className="lists-head" style={{ padding: "0 8px" }}>
            Steps
          </div>
          <div className="steps-list">
            {task.steps.map((s) => (
              <div key={s.id} className={`step-row${s.done ? " done" : ""}`}>
                <div
                  className={`check${s.done ? " done" : ""}`}
                  style={{ width: 16, height: 16, fontSize: 9 }}
                  onClick={() => onToggleStep(s.id)}
                >
                  {s.done ? "✓" : ""}
                </div>
                <input type="text" value={s.text} onChange={(e) => onRenameStep(s.id, e.target.value)} />
                <span className="close-detail" style={{ fontSize: 13 }} onClick={() => onRemoveStep(s.id)}>
                  ✕
                </span>
              </div>
            ))}
          </div>
          <div className="add-step" onClick={submitStep}>
            <span className="ic">＋</span>
            <input
              type="text"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitStep()}
              placeholder="Add step"
              style={{ background: "transparent", border: "none", flex: 1, color: "inherit" }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="d-section">
          <div className="lists-head" style={{ padding: "0 8px" }}>
            Notes
          </div>
          <textarea
            className="dnotes"
            value={task.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Add notes..."
          />
        </div>

        <div className="d-meta">Created {new Date(task.created_at).toLocaleDateString()}</div>
        <div className="d-delete" onClick={onDelete}>
          <span className="ic">🗑</span>Delete task
        </div>
      </div>
    </div>
  );
}
