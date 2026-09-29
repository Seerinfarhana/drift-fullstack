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

  // Study/work time allocation
  start_time: string | null;
  end_time: string | null;

  reminder: string | null;

  repeat:
    | "daily"
    | "weekly"
    | "monthly"
    | null;

  list_id: string;

  created_at: string;

  steps: Step[];
}

/*
  Special views:
  myday
  important
  planned

  Or a custom list ID.
*/
export type ViewId =
  | "myday"
  | "important"
  | "planned"
  | string;

/*
  Fields that can be updated
  using PATCH /api/tasks/{id}
*/
export interface TaskUpdatePayload {
  title?: string;

  notes?: string;

  completed?: boolean;

  important?: boolean;

  my_day?: boolean;

  due_date?: string | null;

  start_time?: string | null;

  end_time?: string | null;

  reminder?: string | null;

  repeat?:
    | "daily"
    | "weekly"
    | "monthly"
    | ""
    | null;

  list_id?: string;
}