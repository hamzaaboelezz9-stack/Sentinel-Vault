export class CryptoClient {
  private worker?: Worker;
  private sequence = 0;
  private requests = new Map<
    number,
    {
      resolve: (v: any) => void;
      reject: (e: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private start() {
    if (this.worker) return;
    this.worker = new Worker(new URL("./crypto-worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = ({ data }) => {
      const request = this.requests.get(data.id);
      if (!request) return;
      clearTimeout(request.timer);
      this.requests.delete(data.id);
      data.error
        ? request.reject(new Error(data.error))
        : request.resolve(data.value);
    };
    this.worker.onerror = () => this.lock();
  }
  call<T = any>(action: string, args: any = {}): Promise<T> {
    this.start();
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.lock();
        reject(new Error("Crypto operation timed out. Unlock again."));
      }, 150000);
      this.requests.set(id, { resolve, reject, timer });
      const transfers = Object.values(args)
        .filter((v): v is Uint8Array<ArrayBuffer> => v instanceof Uint8Array)
        .map((v) => v.buffer);
      this.worker!.postMessage({ id, action, args }, transfers);
    });
  }
  lock() {
    this.worker?.terminate();
    this.worker = undefined;
    for (const pending of this.requests.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Vault locked."));
    }
    this.requests.clear();
  }
}
