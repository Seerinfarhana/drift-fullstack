import { useState } from "react";
import type { TaskList, ViewId } from "../types";
import { useAuth } from "../hooks/useAuth";
import { requestNotificationPermission } from "../utils/notifications";

interface Props {
  lists: TaskList[];
  view: ViewId;

  counts: {
    myday: number;
    important: number;
    planned: number;
    byList: Record<string, number>;
  };

  onSetView: (view: ViewId) => void;
  onCreateList: (name: string) => void;

  // Mobile sidebar controls
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  lists,
  view,
  counts,
  onSetView,
  onCreateList,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const { user, logout } = useAuth();

  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  const customLists = lists.filter((list) => !list.is_default);

  const defaultList = lists.find((list) => list.is_default);

  function handleViewChange(newView: ViewId) {
    onSetView(newView);

    // Close sidebar after selecting something on mobile
    onCloseMobile();
  }

  function commitNewList() {
    const name = newListName.trim();

    if (name) {
      onCreateList(name);
    }

    setNewListName("");
    setAddingList(false);
  }

  async function enableNotifications() {
    const enabled = await requestNotificationPermission();

    if (enabled) {
      alert("Notifications enabled");
    }
  }

  return (
    <aside
      className={`sidebar${mobileOpen ? " mobile-open" : ""}`}
    >
      {/* USER */}
      <div className="side-top">
        <div className="user-chip">
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="user-name">
            {user?.name}
          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Sign out
          </button>

          {/* Only visible on mobile */}
          <button
            className="mobile-sidebar-close"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <div className="nav">
        <button
          className={`nav-item${view === "myday" ? " active" : ""}`}
          onClick={() => handleViewChange("myday")}
        >
          <span className="ic">☀</span>

          <span>My Day</span>

          <span className="count">
            {counts.myday || ""}
          </span>
        </button>

        <button
          className={`nav-item${
            view === "important" ? " active" : ""
          }`}
          onClick={() => handleViewChange("important")}
        >
          <span className="ic">★</span>

          <span>Important</span>

          <span className="count">
            {counts.important || ""}
          </span>
        </button>

        <button
          className={`nav-item${
            view === "planned" ? " active" : ""
          }`}
          onClick={() => handleViewChange("planned")}
        >
          <span className="ic">📅</span>

          <span>Planned</span>

          <span className="count">
            {counts.planned || ""}
          </span>
        </button>

        {defaultList && (
          <button
            className={`nav-item${
              view === defaultList.id ? " active" : ""
            }`}
            onClick={() => handleViewChange(defaultList.id)}
          >
            {/* Use a different icon here.
                ☰ should be reserved for the mobile menu. */}
            <span className="ic">✓</span>

            <span>Tasks</span>

            <span className="count">
              {counts.byList[defaultList.id] || ""}
            </span>
          </button>
        )}
      </div>

      <div className="side-divider" />

      {/* MY LISTS */}
      <div className="lists-head">
        My Lists
      </div>

      <div className="lists-wrap">
        {customLists.map((list) => (
          <button
            key={list.id}
            className={`nav-item${
              view === list.id ? " active" : ""
            }`}
            onClick={() => handleViewChange(list.id)}
          >
            <span className="ic">▤</span>

            <span>{list.name}</span>

            <span className="count">
              {counts.byList[list.id] || ""}
            </span>
          </button>
        ))}
      </div>

      {/* CREATE LIST */}
      {addingList ? (
        <div className="new-list-row">
          <input
            autoFocus
            value={newListName}
            placeholder="List name"
            onChange={(event) =>
              setNewListName(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitNewList();
              }

              if (event.key === "Escape") {
                setAddingList(false);
                setNewListName("");
              }
            }}
            onBlur={commitNewList}
          />
        </div>
      ) : (
        <button
          className="add-list-btn"
          onClick={() => setAddingList(true)}
        >
          <span className="ic">＋</span>
          <span>New list</span>
        </button>
      )}

      <div className="side-divider" />

      {/* NOTIFICATIONS */}
      <button
        className="notification-btn"
        onClick={enableNotifications}
      >
        <span className="ic">🔔</span>
        <span>Enable Notifications</span>
      </button>
    </aside>
  );
}