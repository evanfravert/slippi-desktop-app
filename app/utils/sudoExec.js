import { app } from 'electron';

import log from 'electron-log';
import sudo from 'sudo-prompt';
import path from 'path';
import { exec } from 'child_process';

const sudoOptions = {
  name: "Slippi Desktop App",
};

export async function sudoRemovePath(pathToRemove) {
  const platform = process.platform;
  switch (platform) {
  case "win32": // windows
    await sudoExecAsyncWindows(`rmdir /Q /S "${pathToRemove}"`);
    break;
  default:
    await sudoExecAsyncNonWindows("rm -rf \"$DOLPHIN_PATH\"", { ...sudoOptions, env: { DOLPHIN_PATH: pathToRemove } });
  }
}

export function sudoExecAsyncNonWindows(command, options) {
  return new Promise((resolve, reject) => {
    sudo.exec(
      command,
      options,
      (error) => {
        if (
          error == null
        ) {
          resolve();
        } else {
          reject(new Error(`Could not run elevated command: ${error}`));
        }
      });
  });
}

export function sudoExecAsyncWindows(command) {
  const appPath = app.getAppPath();
  const elevatePath = path.join(appPath, "../app.asar.unpacked/static/elevate.exe");
  return new Promise((resolve, reject) => {
    exec(
      `"${elevatePath}" -c -w ${command}`,
      (error, stdout, stderr) => {
        log.info(stdout);
        log.info(stderr);
        if (
          error == null
        ) {
          resolve();
        } else {
          reject(new Error(`Could not run elevated command: ${error}`));
        }
      });
  });
}
