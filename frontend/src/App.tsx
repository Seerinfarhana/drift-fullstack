import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { api } from "./api";
import type { Task, TaskList, TaskUpdatePayload, ViewId } from "./types";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import TaskListPanel from "./components/TaskList";
import DetailPanel from "./components/DetailPanel";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 40, color: "#8B8B99" }}>Loading…</div>;
  if (!user) return <AuthScreen />;
  return <Workspace />;
}

function Workspace() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewId>("myday");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([api.getLists(), api.getTasks({})]).then(([l, t]) => {
      setLists(l);
      setTasks(t);
      setReady(true);
    });
  }, []);

  const defaultListId = useMemo(() => lists.find((l) => l.is_default)?.id, [lists]);

  const viewTasks = useMemo(() => {
    if (view === "myday") return tasks.filter((t) => t.my_day_date === todayStr());
    if (view === "important") return tasks.filter((t) => t.important);
    if (view === "planned") return tasks.filter((t) => !!t.due_date);
    return tasks.filter((t) => t.list_id === view);
  }, [tasks, view]);

  const counts = useMemo(() => {
    const byList: Record<string, number> = {};
    lists.forEach((l) => (byList[l.id] = tasks.filter((t) => t.list_id === l.id && !t.completed).length));
    return {
      myday: tasks.filter((t) => t.my_day_date === todayStr() && !t.completed).length,
      important: tasks.filter((t) => t.important && !t.completed).length,
      planned: tasks.filter((t) => t.due_date && !t.completed).length,
      byList,
    };
  }, [tasks, lists]);

  const viewTitles: Record<string, string> = {
    myday: "My Day",
    important: "Important",
    planned: "Planned",
  };
  const viewTitle = viewTitles[view] || lists.find((l) => l.id === view)?.name || "List";

  const selectedTask = tasks.find((t) => t.id === selectedId) || null;

  async function handleAddTask(title: string) {
    const listId = ["myday", "important", "planned"].includes(view) ? defaultListId! : view;
    const created = await api.createTask(title, listId);
    const patch: TaskUpdatePayload = {};
    if (view === "myday") patch.my_day = true;
    if (view === "important") patch.important = true;
    const finalTask = Object.keys(patch).length ? await api.updateTask(created.id, patch) : created;
    setTasks((prev) => [finalTask, ...prev]);
  }

  function patchLocal(id: string, updater: (t: Task) => Task) {
    setTasks((prev) => prev.map((t) => (t.id === id ? updater(t) : t)));
  }

  async function handleUpdate(id: string, patch: TaskUpdatePayload) {
    const updated = await api.updateTask(id, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleToggleDone(id: string) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    await handleUpdate(id, { completed: !t.completed });
  }

  async function handleToggleImportant(id: string) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    await handleUpdate(id, { important: !t.important });
  }

  async function handleDelete(id: string) {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedId(null);
  }

  async function handleCreateList(name: string) {
    const created = await api.createList(name);
    setLists((prev) => [...prev, created]);
  }

  async function handleAddStep(taskId: string, text: string) {
    const step = await api.addStep(taskId, text);
    patchLocal(taskId, (t) => ({ ...t, steps: [...t.steps, step] }));
  }

  async function handleToggleStep(taskId: string, stepId: string) {
    const task = tasks.find((t) => t.id === taskId);
    const step = task?.steps.find((s) => s.id === stepId);
    if (!step) return;
    const updated = await api.updateStep(taskId, stepId, { done: !step.done });
    patchLocal(taskId, (t) => ({ ...t, steps: t.steps.map((s) => (s.id === stepId ? updated : s)) }));
  }

  async function handleRenameStep(taskId: string, stepId: string, text: string) {
    patchLocal(taskId, (t) => ({ ...t, steps: t.steps.map((s) => (s.id === stepId ? { ...s, text } : s)) }));
    await api.updateStep(taskId, stepId, { text });
  }

  async function handleRemoveStep(taskId: string, stepId: string) {
    await api.deleteStep(taskId, stepId);
    patchLocal(taskId, (t) => ({ ...t, steps: t.steps.filter((s) => s.id !== stepId) }));
  }

  if (!ready) return <div style={{ padding: 40, color: "#8B8B99" }}>Loading your tasks…</div>;

  return (
    <div className="app">
      <Sidebar lists={lists} view={view} counts={counts} onSetView={setView} onCreateList={handleCreateList} />
      <div className="main">
        <TaskListPanel
          view={view}
          viewTitle={viewTitle}
          tasks={viewTasks}
          onAddTask={handleAddTask}
          onToggleDone={handleToggleDone}
          onToggleImportant={handleToggleImportant}
          onOpenTask={setSelectedId}
        />
        {selectedTask && (
          <DetailPanel
            task={selectedTask}
            lists={lists}
            onClose={() => setSelectedId(null)}
            onUpdate={(patch) => handleUpdate(selectedTask.id, patch)}
            onToggleDone={() => handleToggleDone(selectedTask.id)}
            onDelete={() => handleDelete(selectedTask.id)}
            onAddStep={(text) => handleAddStep(selectedTask.id, text)}
            onToggleStep={(stepId) => handleToggleStep(selectedTask.id, stepId)}
            onRenameStep={(stepId, text) => handleRenameStep(selectedTask.id, stepId, text)}
            onRemoveStep={(stepId) => handleRemoveStep(selectedTask.id, stepId)}
          />
        )}
      </div>
    </div>
  );
}
