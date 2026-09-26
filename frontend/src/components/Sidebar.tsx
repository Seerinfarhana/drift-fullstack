import { useState } from "react";
import type { TaskList, ViewId } from "../types";
import { useAuth } from "../hooks/useAuth";

interface Props {
  lists: TaskList[];
  view: ViewId;
  counts: { myday: number; important: number; planned: number; byList: Record<string, number> };
  onSetView: (v: ViewId) => void;
  onCreateList: (name: string) => void;
}

export default function Sidebar({ lists, view, counts, onSetView, onCreateList }: Props) {
  const { user, logout } = useAuth();
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  function commitNewList() {
    const name = newListName.trim();
    if (name) onCreateList(name);
    setNewListName("");
    setAddingList(false);
  }

  const customLists = lists.filter((l) => !l.is_default);
  const defaultList = lists.find((l) => l.is_default);

  return (
    <div className="sidebar">
      <div className="side-top">
        <div className="user-chip">
          <div className="avatar">{user?.name.charAt(0).toUpperCase()}</div>
          <div className="user-name">{user?.name}</div>
          <button className="logout-btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
      <div className="nav">
        <button className={`nav-item${view === "myday" ? " active" : ""}`} onClick={() => onSetView("myday")}>
          <span className="ic">☀</span>My Day
          <span className="count">{counts.myday || ""}</span>
        </button>
        <button
          className={`nav-item${view === "important" ? " active" : ""}`}
          onClick={() => onSetView("important")}
        >
          <span className="ic">★</span>Important
          <span className="count">{counts.important || ""}</span>
        </button>
        <button className={`nav-item${view === "planned" ? " active" : ""}`} onClick={() => onSetView("planned")}>
          <span className="ic">📅</span>Planned
          <span className="count">{counts.planned || ""}</span>
        </button>
        {defaultList && (
          <button
            className={`nav-item${view === defaultList.id ? " active" : ""}`}
            onClick={() => onSetView(defaultList.id)}
          >
            <span className="ic">☰</span>Tasks
            <span className="count">{counts.byList[defaultList.id] || ""}</span>
          </button>
        )}
      </div>
      <div className="side-divider" />
      <div className="lists-head">My Lists</div>
      <div className="lists-wrap">
        {customLists.map((l) => (
          <button
            key={l.id}
            className={`nav-item${view === l.id ? " active" : ""}`}
            onClick={() => onSetView(l.id)}
          >
            <span className="ic">▤</span>
            {l.name}
            <span className="count">{counts.byList[l.id] || ""}</span>
          </button>
        ))}
      </div>
      {addingList ? (
        <div className="new-list-row">
          <input
            autoFocus
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitNewList()}
            onBlur={commitNewList}
            placeholder="List name"
          />
        </div>
      ) : (
        <button className="add-list-btn" onClick={() => setAddingList(true)}>
          <span className="ic">＋</span>New list
        </button>
      )}
    </div>
  );
}
