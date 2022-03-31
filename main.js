"use strict";

const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow = null;
let subpy = null;

const PY_EXE_FILE = path.join(__dirname, "dist-python/app.exe");

const PY_ENTRY_FILE = path.join(__dirname, "web/app.py");

const startPythonSubprocess = () => {
    if (app.isPackaged) {
        subpy = require("child_process").execFile(PY_EXE_FILE, []);
    } else {
        subpy = require("child_process").spawn("python", [PY_ENTRY_FILE]);
    }
};

const killPythonSubprocesses = (main_pid) => {
    let exeFilename = app.isPackaged
        ? path.basename(PY_EXE_FILE)
        : path.basename(PY_ENTRY_FILE);

    let cleanupCompleted = false;
    require("ps-tree")(main_pid, (err, children) => {
        // Kill all child processes.
        children.forEach((x) => {
            console.log(x);
            if (x.COMMAND == exeFilename) process.kill(x.PID);
        });
        subpy = null;
        cleanupCompleted = true;
    });

    subpy.kill("SIGINT");

    return new Promise(function (resolve, reject) {
        (function waitForSubProcessCleanup() {
            if (cleanupCompleted) return resolve();
            setTimeout(waitForSubProcessCleanup, 30);
        })();
    });
};

const createMainWindow = () => {
    // Create the browser mainWindow
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        autoHideMenuBar: true,
        resizeable: false,
    });

    // Load the index page
    mainWindow.loadURL("http://127.0.0.1:5001/");

    if (!app.isPackaged) mainWindow.openDevTools();

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function () {
    console.log("ready");
    // start the backend server
    startPythonSubprocess();
    createMainWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    console.log("window-all-closed");
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        killPythonSubprocesses(process.pid).then(() => {
            app.quit();
        });
    }
});

app.on("activate", () => {
    createMainWindow();
});

app.on("quit", function () {
    console.log("quit");
    // do some additional cleanup
    killPythonSubprocesses(process.pid).then(() => {
        app.quit();
    });
});
