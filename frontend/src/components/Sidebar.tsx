import { useState } from "react";
import type {
  TaskList,
  ViewId,
} from "../types";

import { useAuth } from "../hooks/useAuth";

import {
  requestNotificationPermission,
} from "../utils/notifications";

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

  onCreateList: (
    name: string
  ) => void;

  // MOBILE
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
  const {
    user,
    logout,
  } = useAuth();

  const [
    addingList,
    setAddingList,
  ] = useState(false);

  const [
    newListName,
    setNewListName,
  ] = useState("");

  function changeView(
    newView: ViewId
  ) {
    onSetView(newView);

    // Close sidebar automatically on phone
    onCloseMobile();
  }

  function commitNewList() {
    const name =
      newListName.trim();

    if (name) {
      onCreateList(name);
    }

    setNewListName("");
    setAddingList(false);
  }

  async function enableNotifications() {
    const enabled =
      await requestNotificationPermission();

    if (enabled) {
      alert(
        "Notifications enabled"
      );
    }
  }

  const customLists =
    lists.filter(
      (list) =>
        !list.is_default
    );

  const defaultList =
    lists.find(
      (list) =>
        list.is_default
    );

  return (
    <div
      className={`sidebar${
        mobileOpen
          ? " mobile-open"
          : ""
      }`}
    >

      {/* USER */}
      <div className="side-top">
        <div className="user-chip">

          <div className="avatar">
            {user?.name
              ?.charAt(0)
              .toUpperCase()}
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

          {/* Mobile close button */}
          <button
            className="mobile-sidebar-close"
            onClick={
              onCloseMobile
            }
            aria-label="Close menu"
          >
            ✕
          </button>

        </div>
      </div>

      {/* NAVIGATION */}
      <div className="nav">

        <button
          className={`nav-item${
            view === "myday"
              ? " active"
              : ""
          }`}
          onClick={() =>
            changeView("myday")
          }
        >
          <span className="ic">
            ☀
          </span>

          My Day

          <span className="count">
            {counts.myday || ""}
          </span>
        </button>

        <button
          className={`nav-item${
            view === "important"
              ? " active"
              : ""
          }`}
          onClick={() =>
            changeView(
              "important"
            )
          }
        >
          <span className="ic">
            ★
          </span>

          Important

          <span className="count">
            {counts.important ||
              ""}
          </span>
        </button>

        <button
          className={`nav-item${
            view === "planned"
              ? " active"
              : ""
          }`}
          onClick={() =>
            changeView("planned")
          }
        >
          <span className="ic">
            📅
          </span>

          Planned

          <span className="count">
            {counts.planned || ""}
          </span>
        </button>

        {defaultList && (
          <button
            className={`nav-item${
              view ===
              defaultList.id
                ? " active"
                : ""
            }`}
            onClick={() =>
              changeView(
                defaultList.id
              )
            }
          >
            <span className="ic">
              ☰
            </span>

            Tasks

            <span className="count">
              {counts.byList[
                defaultList.id
              ] || ""}
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

        {customLists.map(
          (list) => (
            <button
              key={list.id}
              className={`nav-item${
                view === list.id
                  ? " active"
                  : ""
              }`}
              onClick={() =>
                changeView(
                  list.id
                )
              }
            >
              <span className="ic">
                ▤
              </span>

              {list.name}

              <span className="count">
                {counts.byList[
                  list.id
                ] || ""}
              </span>
            </button>
          )
        )}

      </div>

      {/* NEW LIST */}
      {addingList ? (
        <div className="new-list-row">

          <input
            autoFocus
            value={newListName}
            onChange={(event) =>
              setNewListName(
                event.target.value
              )
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                commitNewList();
              }
            }}
            onBlur={
              commitNewList
            }
            placeholder="List name"
          />

        </div>
      ) : (
        <button
          className="add-list-btn"
          onClick={() =>
            setAddingList(true)
          }
        >
          <span className="ic">
            ＋
          </span>

          New list
        </button>
      )}

      <div className="side-divider" />

      {/* NOTIFICATIONS */}
      <button
        className="notification-btn"
        onClick={
          enableNotifications
        }
      >
        <span className="ic">
          🔔
        </span>

        Enable Notifications
      </button>

    </div>
  );
}