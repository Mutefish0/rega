const request = window.indexedDB.open("rega", 2);

let _dbPromise: Promise<IDBDatabase> = new Promise((resolve, reject) => {
  request.onerror = (event) => {
    console.log("Database error: ", event);

    reject("Database error");
  };

  request.onupgradeneeded = (event: any) => {
    const db = event.target.result as IDBDatabase;
    console.log("uodate event", event);

    // 创建对象存储
    if (!db.objectStoreNames.contains("textures")) {
      db.createObjectStore("textures", { keyPath: "id" });
    }
  };
  request.onsuccess = (event: any) => {
    const db = event.target.result as IDBDatabase;
    resolve(db);
    console.log("Database success: ", event);
  };
});

export default class DBStore {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  private async getStore(mode: IDBTransactionMode = "readonly") {
    const db = await _dbPromise;
    return db.transaction(this.name, mode).objectStore(this.name);
  }

  async add(data: any) {
    const store = await this.getStore("readwrite");

    return new Promise<void>((resolve, reject) => {
      const request = store.add(data);

      request.onsuccess = (event) => {
        resolve();
      };

      request.onerror = (event) => {
        reject();
      };
    });
  }

  async get(key: string) {
    const store = await this.getStore();

    return new Promise<any>((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = (event) => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject();
      };
    });
  }
}
