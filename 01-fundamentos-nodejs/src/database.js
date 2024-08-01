import fs from 'node:fs/promises';

// the current folder => import.meta.url will be the base
// '../db.json' will be appended to the base, returning one folder
const databasePath = new URL('../db.json', import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => (this.#database = JSON.parse(data)))
      .catch(() => this.#persist()); // in case of no file, will create one
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  #findIndexObjectById(table, id) {
    return this.#database[table].findIndex(element => element.id === id);
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter(row =>
        Object.entries(search).some(([key, value]) => row[key].includes(value))
      ); // name includes 'Jr.'
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  delete(table, id) {
    const rowIndex = this.#findIndexObjectById(table, id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }

  update(table, obj) {
    console.log(obj);
    const rowIndex = this.#findIndexObjectById(table, obj.id);

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = obj;

      this.#persist();
    }
  }
}
