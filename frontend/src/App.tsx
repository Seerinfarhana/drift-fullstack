import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "./hooks/useAuth";

import {
  api,
} from "./api";

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


function todayStr() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


export default function App() {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          color:
            "#8B8B99",
        }}
      >
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
  const [
    lists,
    setLists,
  ] = useState<TaskList[]>(
    []
  );

  const [
    tasks,
    setTasks,
  ] = useState<Task[]>(
    []
  );

  const [
    view,
    setView,
  ] =
    useState<ViewId>(
      "myday"
    );

  const [
    selectedId,
    setSelectedId,
  ] =
    useState<
      string | null
    >(null);

  const [
    ready,
    setReady,
  ] = useState(false);

  // MOBILE SIDEBAR
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);


  // LOAD DATA
  useEffect(() => {
    async function loadData() {
      try {
        const [
          listData,
          taskData,
        ] =
          await Promise.all([
            api.getLists(),
            api.getTasks(
              {}
            ),
          ]);

        setLists(
          listData
        );

        setTasks(
          taskData
        );
      } catch (
        error
      ) {
        console.error(
          "Failed to load data:",
          error
        );

        alert(
          "Could not load your tasks."
        );
      } finally {
        setReady(
          true
        );
      }
    }

    loadData();
  }, []);


  const defaultListId =
    useMemo(
      () =>
        lists.find(
          (list) =>
            list.is_default
        )?.id,
      [lists]
    );


  // FILTER TASKS
  const viewTasks =
    useMemo(() => {
      if (
        view ===
        "myday"
      ) {
        return tasks.filter(
          (task) =>
            task.my_day_date ===
            todayStr()
        );
      }

      if (
        view ===
        "important"
      ) {
        return tasks.filter(
          (task) =>
            task.important
        );
      }

      if (
        view ===
        "planned"
      ) {
        return tasks.filter(
          (task) =>
            !!task.due_date
        );
      }

      return tasks.filter(
        (task) =>
          task.list_id ===
          view
      );
    }, [tasks, view]);


  // COUNTS
  const counts =
    useMemo(() => {
      const byList:
        Record<
          string,
          number
        > = {};

      lists.forEach(
        (list) => {
          byList[
            list.id
          ] =
            tasks.filter(
              (task) =>
                task.list_id ===
                  list.id &&
                !task.completed
            ).length;
        }
      );

      return {
        myday:
          tasks.filter(
            (task) =>
              task.my_day_date ===
                todayStr() &&
              !task.completed
          ).length,

        important:
          tasks.filter(
            (task) =>
              task.important &&
              !task.completed
          ).length,

        planned:
          tasks.filter(
            (task) =>
              task.due_date &&
              !task.completed
          ).length,

        byList,
      };
    }, [tasks, lists]);


  const viewTitles:
    Record<
      string,
      string
    > = {
      myday: "My Day",
      important:
        "Important",
      planned:
        "Planned",
    };


  const viewTitle =
    viewTitles[view] ||
    lists.find(
      (list) =>
        list.id ===
        view
    )?.name ||
    "List";


  const selectedTask =
    tasks.find(
      (task) =>
        task.id ===
        selectedId
    ) || null;


  // APPLY UPDATE LOCALLY
  function applyPatch(
    task: Task,
    patch: TaskUpdatePayload
  ): Task {
    const updated: Task =
      {
        ...task,
      };

    if (
      patch.title !==
      undefined
    ) {
      updated.title =
        patch.title;
    }

    if (
      patch.notes !==
      undefined
    ) {
      updated.notes =
        patch.notes;
    }

    if (
      patch.completed !==
      undefined
    ) {
      updated.completed =
        patch.completed;
    }

    if (
      patch.important !==
      undefined
    ) {
      updated.important =
        patch.important;
    }

    if (
      patch.due_date !==
      undefined
    ) {
      updated.due_date =
        patch.due_date;
    }

    if (
      patch.start_time !==
      undefined
    ) {
      updated.start_time =
        patch.start_time;
    }

    if (
      patch.end_time !==
      undefined
    ) {
      updated.end_time =
        patch.end_time;
    }

    if (
      patch.reminder !==
      undefined
    ) {
      updated.reminder =
        patch.reminder;
    }

    if (
      patch.list_id !==
      undefined
    ) {
      updated.list_id =
        patch.list_id;
    }

    if (
      patch.repeat !==
      undefined
    ) {
      updated.repeat =
        patch.repeat ===
        ""
          ? null
          : patch.repeat ??
            null;
    }

    if (
      patch.my_day !==
      undefined
    ) {
      updated.my_day_date =
        patch.my_day
          ? todayStr()
          : null;
    }

    return updated;
  }


  // ADD TASK - OPTIMISTIC
  async function handleAddTask(
    title: string
  ) {
    let listId:
      string | undefined;

    if (
      view ===
        "myday" ||
      view ===
        "important" ||
      view ===
        "planned"
    ) {
      listId =
        defaultListId;
    } else {
      listId =
        view;
    }

    if (!listId) {
      alert(
        "Could not find a task list."
      );

      return;
    }


    const tempId =
      `temp-${Date.now()}-${Math.random()}`;


    // Create temporary task
    const tempTask: Task =
      {
        id: tempId,

        title,

        notes: "",

        completed:
          false,

        important:
          view ===
          "important",

        my_day_date:
          view ===
          "myday"
            ? todayStr()
            : null,

        due_date:
          view ===
          "planned"
            ? todayStr()
            : null,

        start_time:
          null,

        end_time:
          null,

        reminder:
          null,

        repeat:
          null,

        list_id:
          listId,

        created_at:
          new Date().toISOString(),

        steps: [],
      };


    // SHOW IMMEDIATELY
    setTasks(
      (previous) => [
        tempTask,
        ...previous,
      ]
    );


    try {
      // Save task
      let created =
        await api.createTask(
          title,
          listId
        );


      // Special views
      const patch:
        TaskUpdatePayload =
        {};


      if (
        view ===
        "myday"
      ) {
        patch.my_day =
          true;
      }


      if (
        view ===
        "important"
      ) {
        patch.important =
          true;
      }


      if (
        view ===
        "planned"
      ) {
        patch.due_date =
          todayStr();
      }


      if (
        Object.keys(
          patch
        ).length > 0
      ) {
        created =
          await api.updateTask(
            created.id,
            patch
          );
      }


      // Replace temporary task
      setTasks(
        (previous) =>
          previous.map(
            (task) =>
              task.id ===
              tempId
                ? created
                : task
          )
      );


      // If temp task was selected
      setSelectedId(
        (current) =>
          current ===
          tempId
            ? created.id
            : current
      );
    } catch (
      error
    ) {
      console.error(
        "Create task failed:",
        error
      );


      // Remove temporary task
      setTasks(
        (previous) =>
          previous.filter(
            (task) =>
              task.id !==
              tempId
          )
      );


      alert(
        "Could not save the task. Please try again."
      );
    }
  }


  // UPDATE TASK - OPTIMISTIC
  async function handleUpdate(
    id: string,
    patch: TaskUpdatePayload
  ): Promise<boolean> {
    const oldTask =
      tasks.find(
        (task) =>
          task.id === id
      );

    if (!oldTask) {
      return false;
    }


    // Update screen immediately
    setTasks(
      (previous) =>
        previous.map(
          (task) =>
            task.id ===
            id
              ? applyPatch(
                  task,
                  patch
                )
              : task
        )
    );


    try {
      await api.updateTask(
        id,
        patch
      );

      return true;
    } catch (
      error
    ) {
      console.error(
        "Update failed:",
        error
      );


      // Rollback
      setTasks(
        (previous) =>
          previous.map(
            (task) =>
              task.id ===
              id
                ? oldTask
                : task
          )
      );


      alert(
        "Could not save the change."
      );

      return false;
    }
  }


  function patchLocal(
    id: string,
    updater: (
      task: Task
    ) => Task
  ) {
    setTasks(
      (previous) =>
        previous.map(
          (task) =>
            task.id ===
            id
              ? updater(
                  task
                )
              : task
        )
    );
  }


  // COMPLETE
  async function handleToggleDone(
    id: string
  ) {
    const task =
      tasks.find(
        (task) =>
          task.id ===
          id
      );

    if (!task) return;

    await handleUpdate(
      id,
      {
        completed:
          !task.completed,
      }
    );
  }


  // IMPORTANT
  async function handleToggleImportant(
    id: string
  ) {
    const task =
      tasks.find(
        (task) =>
          task.id ===
          id
      );

    if (!task) return;

    await handleUpdate(
      id,
      {
        important:
          !task.important,
      }
    );
  }


  // DELETE - OPTIMISTIC
  async function handleDelete(
    id: string
  ) {
    const oldTask =
      tasks.find(
        (task) =>
          task.id ===
          id
      );

    if (!oldTask) {
      return;
    }


    // Remove immediately
    setTasks(
      (previous) =>
        previous.filter(
          (task) =>
            task.id !==
            id
        )
    );

    setSelectedId(
      null
    );


    try {
      await api.deleteTask(
        id
      );
    } catch (
      error
    ) {
      console.error(
        "Delete failed:",
        error
      );


      // Restore if failed
      setTasks(
        (previous) => [
          oldTask,
          ...previous,
        ]
      );


      alert(
        "Could not delete the task."
      );
    }
  }


  // CREATE LIST
  async function handleCreateList(
    name: string
  ) {
    try {
      const created =
        await api.createList(
          name
        );

      setLists(
        (previous) => [
          ...previous,
          created,
        ]
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      alert(
        "Could not create the list."
      );
    }
  }


  // ADD STEP
  async function handleAddStep(
    taskId: string,
    text: string
  ) {
    try {
      const step =
        await api.addStep(
          taskId,
          text
        );

      patchLocal(
        taskId,
        (task) => ({
          ...task,

          steps: [
            ...task.steps,
            step,
          ],
        })
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      alert(
        "Could not add step."
      );
    }
  }


  // TOGGLE STEP
  async function handleToggleStep(
    taskId: string,
    stepId: string
  ) {
    const task =
      tasks.find(
        (task) =>
          task.id ===
          taskId
      );

    const step =
      task?.steps.find(
        (step) =>
          step.id ===
          stepId
      );

    if (!step) {
      return;
    }


    // Immediate UI
    patchLocal(
      taskId,
      (task) => ({
        ...task,

        steps:
          task.steps.map(
            (currentStep) =>
              currentStep.id ===
              stepId
                ? {
                    ...currentStep,

                    done:
                      !currentStep.done,
                  }
                : currentStep
          ),
      })
    );


    try {
      await api.updateStep(
        taskId,
        stepId,
        {
          done:
            !step.done,
        }
      );
    } catch (
      error
    ) {
      console.error(
        error
      );


      // Rollback
      patchLocal(
        taskId,
        (task) => ({
          ...task,

          steps:
            task.steps.map(
              (
                currentStep
              ) =>
                currentStep.id ===
                stepId
                  ? step
                  : currentStep
            ),
        })
      );
    }
  }


  // RENAME STEP
  async function handleRenameStep(
    taskId: string,
    stepId: string,
    text: string
  ) {
    patchLocal(
      taskId,
      (task) => ({
        ...task,

        steps:
          task.steps.map(
            (step) =>
              step.id ===
              stepId
                ? {
                    ...step,
                    text,
                  }
                : step
          ),
      })
    );


    try {
      await api.updateStep(
        taskId,
        stepId,
        {
          text,
        }
      );
    } catch (
      error
    ) {
      console.error(
        error
      );
    }
  }


  // REMOVE STEP
  async function handleRemoveStep(
    taskId: string,
    stepId: string
  ) {
    const task =
      tasks.find(
        (task) =>
          task.id ===
          taskId
      );

    const oldSteps =
      task?.steps ||
      [];


    patchLocal(
      taskId,
      (task) => ({
        ...task,

        steps:
          task.steps.filter(
            (step) =>
              step.id !==
              stepId
          ),
      })
    );


    try {
      await api.deleteStep(
        taskId,
        stepId
      );
    } catch (
      error
    ) {
      console.error(
        error
      );


      patchLocal(
        taskId,
        (task) => ({
          ...task,
          steps:
            oldSteps,
        })
      );
    }
  }


  if (!ready) {
    return (
      <div
        style={{
          padding: 40,
          color:
            "#8B8B99",
        }}
      >
        Loading your
        tasks…
      </div>
    );
  }


  return (
    <div className="app">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
        />
      )}


      {/* SIDEBAR */}
      <Sidebar
        lists={lists}
        view={view}
        counts={counts}
        onSetView={setView}
        onCreateList={
          handleCreateList
        }
        mobileOpen={
          sidebarOpen
        }
        onCloseMobile={() =>
          setSidebarOpen(
            false
          )
        }
      />


      {/* MOBILE MENU */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() =>
          setSidebarOpen(
            true
          )
        }
        aria-label="Open menu"
      >
        ☰
      </button>


      {/* MAIN */}
      <div className="main">
        <TaskListPanel
          view={view}
          viewTitle={
            viewTitle
          }
          tasks={
            viewTasks
          }
          onAddTask={
            handleAddTask
          }
          onToggleDone={
            handleToggleDone
          }
          onToggleImportant={
            handleToggleImportant
          }
          onOpenTask={
            setSelectedId
          }
        />


        {selectedTask && (
          <DetailPanel
            task={
              selectedTask
            }
            lists={
              lists
            }
            onClose={() =>
              setSelectedId(
                null
              )
            }
            onUpdate={(
              patch
            ) =>
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
            onAddStep={(
              text
            ) =>
              handleAddStep(
                selectedTask.id,
                text
              )
            }
            onToggleStep={(
              stepId
            ) =>
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
            onRemoveStep={(
              stepId
            ) =>
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