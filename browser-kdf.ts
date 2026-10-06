import type { ArgonKdf } from "./vault";
export function browserKdf(workerUrl: string): ArgonKdf {
  return (password, salt) =>
    new Promise((resolve, reject) => {
      const worker = new Worker(workerUrl),
        pass = new Uint8Array(password),
        nonce = new Uint8Array(salt);
      const finish = () => {
        clearTimeout(timer);
        worker.terminate();
        if (pass.byteLength) pass.fill(0);
        if (nonce.byteLength) nonce.fill(0);
      };
      const timer = setTimeout(() => {
        finish();
        reject(new Error("Key derivation timed out."));
      }, 120000);
      worker.onerror = () => {
        finish();
        reject(new Error("Key derivation unavailable."));
      };
      worker.onmessage = (event) => {
        const output = event.data?.output;
        finish();
        if (output instanceof Uint8Array && output.length === 32)
          resolve(output);
        else reject(new Error("Key derivation failed."));
      };
      // Copy before transfer: the main crypto worker remains responsible for wiping its original buffers.
      worker.postMessage({ password: pass, salt: nonce }, [
        pass.buffer,
        nonce.buffer,
      ]);
    });
}
