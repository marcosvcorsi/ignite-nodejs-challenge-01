import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      const { search } = req.query;

      const tasks = await database.select("tasks", search);

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      const { title, description } = req.body;

      if (!title) {
        return res.writeHead(400).end('{ "error": "Title is required" }');
      }

      if (!description) {
        return res.writeHead(400).end('{ "error": "Description is required" }');
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
      };

      await database.insert("tasks", task);

      return res.end(JSON.stringify(task));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params;

      console.log({ id });

      const [task] = await database.select("tasks", id);

      if (!task) {
        return res.writeHead(404).end('{ "error": "Task not found" }');
      }

      await database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title || !description) {
        return res
          .writeHead(400)
          .end('{ "error": "Title or description is required" }');
      }

      const [task] = await database.select("tasks", id);

      console.log({ id, title, description, task });

      if (!task) {
        return res.writeHead(404).end('{ "error": "Task not found" }');
      }

      await database.update("tasks", id, {
        title,
        description,
        updated_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: async (req, res) => {
      const { id } = req.params;

      const [task] = await database.select("tasks", id);

      console.log({ id, task });

      if (!task) {
        return res.writeHead(404).end('{ "error": "Task not found" }');
      }

      await database.update("tasks", id, {
        completed_at: task.completed_at ? null : new Date(),
        updated_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },
];
