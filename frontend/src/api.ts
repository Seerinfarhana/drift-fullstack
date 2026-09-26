import type { Task, TaskList, TaskUpdatePayload, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "";

let authToken: string | null = localStorage.getItem("drift_token");

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem("drift_token", token);
  else localStorage.removeItem("drift_token");
}

export function getToken() {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* no body */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const api = {
  signup: (name: string, email: string, password: string) =>
    request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/api/auth/me"),

  getLists: () => request<TaskList[]>("/api/lists"),
  createList: (name: string) =>
    request<TaskList>("/api/lists", { method: "POST", body: JSON.stringify({ name }) }),
  deleteList: (id: string) => request<void>(`/api/lists/${id}`, { method: "DELETE" }),

  getTasks: (params: { view?: string; list_id?: string }) => {
    const qs = new URLSearchParams();
    if (params.view) qs.set("view", params.view);
    if (params.list_id) qs.set("list_id", params.list_id);
    return request<Task[]>(`/api/tasks?${qs.toString()}`);
  },
  createTask: (title: string, list_id: string) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify({ title, list_id }) }),
  updateTask: (id: string, patch: TaskUpdatePayload) =>
    request<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteTask: (id: string) => request<void>(`/api/tasks/${id}`, { method: "DELETE" }),

  addStep: (taskId: string, text: string) =>
    request<Task["steps"][number]>(`/api/tasks/${taskId}/steps`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  updateStep: (taskId: string, stepId: string, patch: { text?: string; done?: boolean }) =>
    request<Task["steps"][number]>(`/api/tasks/${taskId}/steps/${stepId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteStep: (taskId: string, stepId: string) =>
    request<void>(`/api/tasks/${taskId}/steps/${stepId}`, { method: "DELETE" }),
};
