import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    return fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  async select(table, search) {
    const data = this.#database[table] || [];

    console.log({ table, data, search });

    if (search) {
      return data.filter((item) => {
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    return data;
  }

  async insert(table, data) {
    const tableData = this.#database[table] || [];

    this.#database[table] = [...tableData, data];

    await this.#persist();

    return data;
  }

  async delete(table, id) {
    const tableData = this.#database[table] || [];

    this.#database[table] = tableData.filter((data) => data.id !== id);

    await this.#persist();
  }

  async update(table, id, data) {
    const tableData = this.#database[table] || [];

    this.#database[table] = tableData.map((item) => {
      if (item.id === id) {
        return { ...item, ...data };
      }

      return item;
    });

    await this.#persist();
  }
}
