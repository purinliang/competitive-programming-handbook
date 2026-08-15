import type { WorkerBindings } from "./env";

export interface Viewer {
  id: string;
  name: string;
  role: "student" | "admin";
}

export type AppEnv = {
  Bindings: WorkerBindings;
  Variables: {
    user: Viewer;
  };
};
