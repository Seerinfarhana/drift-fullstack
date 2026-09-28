import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { api } from "./api";
import type {
  Task,
  TaskList,
  TaskUpdatePayload,
  ViewId,
} from "./types";

import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import TaskListPanel from "./components/TaskList";
import DetailPanel from "./components/DetailPanel";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: 40, color: "#8B8B99" }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <Workspace />;
}

function Workspace() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [view, setView] = useState<ViewId>("myday");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [ready, setReady] = useState(false);

  // MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getLists(),
      api.getTasks({}),
    ]).then(([listData, taskData]) => {
      setLists(listData);
      setTasks(taskData);
      setReady(true);
    });
  }, []);

  const defaultListId = useMemo(
    () => lists.find((list) => list.is_default)?.id,
    [lists]
  );

  const viewTasks = useMemo(() => {
    if (view === "myday") {
      return tasks.filter(
        (task) => task.my_day_date === todayStr()
      );
    }

    if (view === "important") {
      return tasks.filter((task) => task.important);
    }

    if (view === "planned") {
      return tasks.filter((task) => !!task.due_date);
    }

    return tasks.filter((task) => task.list_id === view);
  }, [tasks, view]);

  const counts = useMemo(() => {
    const byList: Record<string, number> = {};

    lists.forEach((list) => {
      byList[list.id] = tasks.filter(
        (task) =>
          task.list_id === list.id &&
          !task.completed
      ).length;
    });

    return {
      myday: tasks.filter(
        (task) =>
          task.my_day_date === todayStr() &&
          !task.completed
      ).length,

      important: tasks.filter(
        (task) =>
          task.important &&
          !task.completed
      ).length,

      planned: tasks.filter(
        (task) =>
          task.due_date &&
          !task.completed
      ).length,

      byList,
    };
  }, [tasks, lists]);

  const viewTitles: Record<string, string> = {
    myday: "My Day",
    important: "Important",
    planned: "Planned",
  };

  const viewTitle =
    viewTitles[view] ||
    lists.find((list) => list.id === view)?.name ||
    "List";

  const selectedTask =
    tasks.find((task) => task.id === selectedId) || null;

  async function handleAddTask(title: string) {
    const listId = ["myday", "important", "planned"].includes(
      view
    )
      ? defaultListId!
      : view;

    const created = await api.createTask(
      title,
      listId
    );

    const patch: TaskUpdatePayload = {};

    if (view === "myday") {
      patch.my_day = true;
    }

    if (view === "important") {
      patch.important = true;
    }

    const finalTask = Object.keys(patch).length
      ? await api.updateTask(created.id, patch)
      : created;

    setTasks((previous) => [
      finalTask,
      ...previous,
    ]);
  }

  function patchLocal(
    id: string,
    updater: (task: Task) => Task
  ) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? updater(task)
          : task
      )
    );
  }

  async function handleUpdate(
    id: string,
    patch: TaskUpdatePayload
  ) {
    const updated = await api.updateTask(
      id,
      patch
    );

    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? updated
          : task
      )
    );
  }

  async function handleToggleDone(id: string) {
    const task = tasks.find(
      (item) => item.id === id
    );

    if (!task) return;

    await handleUpdate(id, {
      completed: !task.completed,
    });
  }

  async function handleToggleImportant(id: string) {
    const task = tasks.find(
      (item) => item.id === id
    );

    if (!task) return;

    await handleUpdate(id, {
      important: !task.important,
    });
  }

  async function handleDelete(id: string) {
    await api.deleteTask(id);

    setTasks((previous) =>
      previous.filter(
        (task) => task.id !== id
      )
    );

    setSelectedId(null);
  }

  async function handleCreateList(name: string) {
    const created = await api.createList(name);

    setLists((previous) => [
      ...previous,
      created,
    ]);
  }

  async function handleAddStep(
    taskId: string,
    text: string
  ) {
    const step = await api.addStep(
      taskId,
      text
    );

    patchLocal(taskId, (task) => ({
      ...task,
      steps: [
        ...task.steps,
        step,
      ],
    }));
  }

  async function handleToggleStep(
    taskId: string,
    stepId: string
  ) {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    const step = task?.steps.find(
      (item) => item.id === stepId
    );

    if (!step) return;

    const updated =
      await api.updateStep(
        taskId,
        stepId,
        {
          done: !step.done,
        }
      );

    patchLocal(taskId, (task) => ({
      ...task,
      steps: task.steps.map((step) =>
        step.id === stepId
          ? updated
          : step
      ),
    }));
  }

  async function handleRenameStep(
    taskId: string,
    stepId: string,
    text: string
  ) {
    patchLocal(taskId, (task) => ({
      ...task,
      steps: task.steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              text,
            }
          : step
      ),
    }));

    await api.updateStep(
      taskId,
      stepId,
      { text }
    );
  }

  async function handleRemoveStep(
    taskId: string,
    stepId: string
  ) {
    await api.deleteStep(
      taskId,
      stepId
    );

    patchLocal(taskId, (task) => ({
      ...task,
      steps: task.steps.filter(
        (step) =>
          step.id !== stepId
      ),
    }));
  }

  if (!ready) {
    return (
      <div
        style={{
          padding: 40,
          color: "#8B8B99",
        }}
      >
        Loading your tasks…
      </div>
    );
  }

  return (
    <div className="app">

      {/* MOBILE DARK OVERLAY */}
      {sidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        lists={lists}
        view={view}
        counts={counts}
        onSetView={setView}
        onCreateList={handleCreateList}
        mobileOpen={sidebarOpen}
        onCloseMobile={() =>
          setSidebarOpen(false)
        }
      />

      {/* MOBILE MENU BUTTON */}
      <button
        className="mobile-menu-btn"
        onClick={() =>
          setSidebarOpen(true)
        }
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="main">

        <TaskListPanel
          view={view}
          viewTitle={viewTitle}
          tasks={viewTasks}
          onAddTask={handleAddTask}
          onToggleDone={handleToggleDone}
          onToggleImportant={
            handleToggleImportant
          }
          onOpenTask={setSelectedId}
        />

        {selectedTask && (
          <DetailPanel
            task={selectedTask}
            lists={lists}
            onClose={() =>
              setSelectedId(null)
            }
            onUpdate={(patch) =>
              handleUpdate(
                selectedTask.id,
                patch
              )
            }
            onToggleDone={() =>
              handleToggleDone(
                selectedTask.id
              )
            }
            onDelete={() =>
              handleDelete(
                selectedTask.id
              )
            }
            onAddStep={(text) =>
              handleAddStep(
                selectedTask.id,
                text
              )
            }
            onToggleStep={(stepId) =>
              handleToggleStep(
                selectedTask.id,
                stepId
              )
            }
            onRenameStep={(
              stepId,
              text
            ) =>
              handleRenameStep(
                selectedTask.id,
                stepId,
                text
              )
            }
            onRemoveStep={(stepId) =>
              handleRemoveStep(
                selectedTask.id,
                stepId
              )
            }
          />
        )}

      </div>
    </div>
  );
}