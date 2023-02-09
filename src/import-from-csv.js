import { readFile } from "node:fs/promises";

const content = await readFile(
  new URL("../resources/tasks.csv", import.meta.url),
  "utf-8"
);

const lines = content.split("\n").splice(1, content.length - 1);

const tasks = await Promise.all(
  lines.map((line) => {
    const [title, description] = line.split(",");

    console.log({ title, description });

    return fetch("http://localhost:3000/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    }).then((res) => res.json());
  })
);

console.log({ tasks });
