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

  onSetView: (v: ViewId) => void;
  onCreateList: (name: string) => void;
}

export default function Sidebar({
  lists,
  view,
  counts,
  onSetView,
  onCreateList,
}: Props) {
  const { user, logout } = useAuth();

  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");

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

  const customLists = lists.filter((list) => !list.is_default);
  const defaultList = lists.find((list) => list.is_default);

  return (
    <div className="sidebar">
      {/* User */}
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
        </div>
      </div>

      {/* Navigation */}
      <div className="nav">
        <button
          className={`nav-item${view === "myday" ? " active" : ""}`}
          onClick={() => onSetView("myday")}
        >
          <span className="ic">☀</span>

          My Day

          <span className="count">
            {counts.myday || ""}
          </span>
        </button>

        <button
          className={`nav-item${view === "important" ? " active" : ""}`}
          onClick={() => onSetView("important")}
        >
          <span className="ic">★</span>

          Important

          <span className="count">
            {counts.important || ""}
          </span>
        </button>

        <button
          className={`nav-item${view === "planned" ? " active" : ""}`}
          onClick={() => onSetView("planned")}
        >
          <span className="ic">📅</span>

          Planned

          <span className="count">
            {counts.planned || ""}
          </span>
        </button>

        {defaultList && (
          <button
            className={`nav-item${
              view === defaultList.id ? " active" : ""
            }`}
            onClick={() => onSetView(defaultList.id)}
          >
            <span className="ic">☰</span>

            Tasks

            <span className="count">
              {counts.byList[defaultList.id] || ""}
            </span>
          </button>
        )}
      </div>

      <div className="side-divider" />

      {/* My Lists */}
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
            onClick={() => onSetView(list.id)}
          >
            <span className="ic">▤</span>

            {list.name}

            <span className="count">
              {counts.byList[list.id] || ""}
            </span>
          </button>
        ))}
      </div>

      {/* Add new list */}
      {addingList ? (
        <div className="new-list-row">
          <input
            autoFocus
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitNewList();
              }
            }}
            onBlur={commitNewList}
            placeholder="List name"
          />
        </div>
      ) : (
        <button
          className="add-list-btn"
          onClick={() => setAddingList(true)}
        >
          <span className="ic">＋</span>
          New list
        </button>
      )}

      {/* Notification */}
      <div className="side-divider" />

      <button
        className="notification-btn"
        onClick={enableNotifications}
      >
        <span className="ic">🔔</span>
        Enable Notifications
      </button>
    </div>
  );
}