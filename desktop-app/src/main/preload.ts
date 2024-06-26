import { Channels } from 'common/constants';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage<T>(channel: Channels, args: T[]) {
      ipcRenderer.send(channel, args);
    },
    on<T>(channel: Channels, func: (...args: T[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: T[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once<T>(channel: Channels, func: (...args: T[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke<T, P>(channel: Channels, ...args: T[]): Promise<P> {
      return ipcRenderer.invoke(channel, ...args);
    },
    removeListener<T>(channel: Channels, listener: (...args: T[]) => void) {
      ipcRenderer.removeListener(channel, listener);
    },
    removeAllListeners(channel: Channels) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
  store: {
    get(val: any) {
      return ipcRenderer.sendSync('electron-store-get', val);
    },
    set(property: string, val: any) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },
});

window.onerror = function (errorMsg, url, lineNumber) {
  // eslint-disable-next-line no-console
  console.log(`Unhandled error: ${errorMsg} ${url} ${lineNumber}`);
  // Code to run when an error has occurred on the page
};
