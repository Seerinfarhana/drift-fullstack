export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TaskList {
  id: string;
  name: string;
  is_default: boolean;
  due_date: string | null;
  reminder: string | null;
}

export interface Step {
  id: string;
  text: string;
  done: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  important: boolean;
  my_day_date: string | null;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
  reminder: string | null;
  repeat: "daily" | "weekly" | "monthly" | null;
  list_id: string;
  created_at: string;
  steps: Step[];
}

export type ViewId = "myday" | "important" | "planned" | string; // string = a list id

export interface TaskUpdatePayload {
  title?: string;
  notes?: string;
  completed?: boolean;
  important?: boolean;
  my_day?: boolean;
  due_date?: string | null;
  reminder?: string | null;
  repeat?: "daily" | "weekly" | "monthly" | "" | null;
  list_id?: string;
}
