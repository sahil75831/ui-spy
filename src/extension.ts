// oraganize/barcnh
import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "uispyidentifier" is now active!'
  );

  // Get runCount from globalState
  let runCount = context.globalState.get<number>("runCount", 0);
  let lineIdentifier = context.globalState.get<string>(
    "lineIdentifier",
    "LineNumber"
  );
  if (lineIdentifier.trim() === "") {
    lineIdentifier = "LineNumber";
  }
  // create a ststau bar button
  const statusBarButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  vscode.window.showInformationMessage("Hello World from uispy!");

  statusBarButton.text = `$(rocket) $(zap) Runs: ${runCount}  Line identifier`;
  statusBarButton.tooltip = "Click to Add or Remove Line Identifier";
  statusBarButton.command = "uispyidentifier.addDynamicAttributes";
  statusBarButton.show();

  statusBarButton.backgroundColor = new vscode.ThemeColor("statusBarItem.");

  // constatnts
  // let lineIdentifier: string =    context.globalState.get<string>("lineIdentifier") || "Line_Identifier";

  const storedLisenceKey = context.globalState.get<string>("lisenceKey");
  let isInitialLoad = true; // Ensures this is defined globally

  // functions

  // function to traverse all activetextedtor
  function traverseAllActiveEditors() {
    const editors = vscode.window.visibleNotebookEditors;

    if (editors.length === 0) {
      vscode.window.showInformationMessage("No open edotor");
      return;
    }

    for (let i = 0; i < editors.length; i++) {
      const editor = editors[i];
    }
  }

  // close
  function closeActiveEditor() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      vscode.window.showInformationMessage("Closing active editor");

      editor.document.save().then(() => {
        vscode.window.showTextDocument(editor.document, { preview: false });
        vscode.commands.executeCommand("workbench.action.closeActiveEditor");
      });
    } else {
      vscode.window.showInformationMessage("No active editor to close");
    }
  }

  // Function to save the active editor content
  function saveActiveEditor() {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
      // Save the active text document
      activeEditor.document.save().then(
        () => console.log("File saved successfully on focus loss"),
        (err) => console.error("Failed to save file:", err)
      );
    } else {
      console.log("No active editor to save");
    }
  }

  function validatingUser(lisenceKey: string): string | null {
    if (lisenceKey === "valid-key") {
      context.globalState.update("lisenceKey", lisenceKey);
      console.log("User validated");
      return null; // Return null to indicate that the input is valid
    } else {
      console.log("Invalid license key");
      return "License Key is not valid"; // Return error message if invalid
    }
  }

  function handleCustomIdentifier(newIdentifier: string): string | null {
    lineIdentifier = newIdentifier;
    if (lineIdentifier.trim() === "") {
      lineIdentifier = "LineNumber";
    }
    console.table({ lineIdentifier });
    context.globalState.update("lineIdentifier", lineIdentifier);
    vscode.window.showInformationMessage(
      `Identifier changed to ${lineIdentifier}`
    );

    // Return null to indicate valid input
    // Or return a string message for invalid input (example validation check)
    if (lineIdentifier.trim() === "") {
      return "Identifier cannot be empty";
    }
    return null;
  }

  async function runActionsForAllFilesInSrc() {
    let lineIdentifier = context.globalState.get<string>(
      "lineIdentifier",
      "Line_Identifier"
    );
    if (lineIdentifier.trim() === "") {
      lineIdentifier = "LineNumber";
    }
    await revertActionsForAllFilesInSrc();
    async function saveActiveFileEditor(document: vscode.TextDocument) {
      try {
        await document.save();
        console.log("File saved successfully.");
      } catch (err) {
        console.error("Failed to save file:", err);
      }
    }

    // Ensure we have a workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showInformationMessage("No workspace folder found.");
      return;
    }

    // Construct the absolute path to the `src` directory within the workspace
    const srcDir = path.join(workspaceFolder.uri.fsPath, "src");
    const srcUri = vscode.Uri.file(srcDir);

    // Ensure the directory exists
    try {
      const srcStat = await vscode.workspace.fs.stat(srcUri);
      if (srcStat.type !== vscode.FileType.Directory) {
        vscode.window.showInformationMessage("`src` is not a directory.");
        return;
      }
    } catch (err) {
      vscode.window.showErrorMessage("`src` directory does not exist.");
      return;
    }

    // Find all files in the `src` directory using a glob pattern
    const files = await vscode.workspace.findFiles(
      "src/**/*",
      "**/node_modules/**"
    );
    if (files.length === 0) {
      vscode.window.showInformationMessage(
        "No files found in the `src` directory."
      );
      return;
    }

    const visibleEditors = vscode.window.visibleTextEditors;
    let prevEditor =
      visibleEditors.length > 1
        ? visibleEditors[visibleEditors.length - 2]
        : null;
    let prevFileName = prevEditor ? prevEditor.document.fileName : "";

    // Loop through each file and apply changes
    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);
      const text = document.getText();
      const htmlRegex =
        /<([a-z][\w\-]*)((?:\s+[\w\-]+(?:="[^"]*")?)*)\s*(\/?)>/g;
      let edits: vscode.TextEdit[] = [];
      let match: RegExpExecArray | null;

      while ((match = htmlRegex.exec(text))) {
        const tagIndex = match.index;
        const line = document.positionAt(tagIndex).line + 1;

        const attribute = ` ${lineIdentifier}="${line} Filepath=${path.basename(
          document.fileName
        )}"`;
        const insertPositionIndex = tagIndex + match[1].length + 1;
        const insertPosition = document.positionAt(insertPositionIndex);
        edits.push(vscode.TextEdit.insert(insertPosition, attribute));
      }

      // Apply changes to the document
      const editor = await vscode.window.showTextDocument(document, {
        preview: false,
      });
      const success = await editor.edit((editBuilder) => {
        edits.forEach((edit) => {
          editBuilder.insert(edit.range.start, edit.newText);
        });
      });

      if (success) {
        await saveActiveFileEditor(document);
      } else {
        console.error("Failed to apply edits for:", document.fileName);
      }
    }

    console.log("Run actions for all files in src function completed");
  }

  async function revertActionsForAllFilesInSrc() {
    let lineIdentifier = context.globalState.get<string>(
      "lineIdentifier",
      "Line_Identifier"
    );
    if (lineIdentifier.trim() === "") {
      lineIdentifier = "LineNumber";
    }
    function saveActiveFileEditor(document: vscode.TextDocument) {
      const activeEditor = document;

      if (activeEditor) {
        // Save the active text document
        activeEditor.save().then(
          () => console.log("File saved successfully on focus loss"),
          (err) => console.error("Failed to save file:", err)
        );
      } else {
        console.log("No active editor to save");
      }
    }
    console.log("revert actions for all files fn called");

    if (!lineIdentifier) {
      vscode.window.showInformationMessage("No line identifier provided");
      return;
    }

    // Ensure we have a workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showInformationMessage("No workspace folder found.");
      return;
    }

    // Construct the absolute path to the `src` directory within the workspace
    const srcDir = path.join(workspaceFolder.uri.fsPath, "src");

    // Ensure the directory exists before proceeding
    const srcUri = vscode.Uri.file(srcDir);
    try {
      const srcStat = await vscode.workspace.fs.stat(srcUri);
      if (srcStat.type !== vscode.FileType.Directory) {
        vscode.window.showInformationMessage("`src` is not a directory.");
        return;
      }
    } catch (err) {
      vscode.window.showErrorMessage("`src` directory does not exist.");
      return;
    }

    // Find all files in the `src` directory using a glob pattern
    const files = await vscode.workspace.findFiles(
      "src/**/*",
      "**/node_modules/**"
    );
    if (files.length === 0) {
      vscode.window.showInformationMessage(
        "No files found in the `src` directory."
      );
      return;
    }

    // Loop through each file and apply the revert function
    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);
      const text = document.getText();

      // Regex to find and remove the line identifier attribute
      const htmlRegex = /<(\w+)(\s[^>]*?)?(\/?)>/g;
      let edits: vscode.TextEdit[] = [];
      let match: RegExpExecArray | null;

      while ((match = htmlRegex.exec(text))) {
        const tagIndex = match.index;

        // Extract the full tag text
        const tagText = match[0];

        // Remove the attribute using a regex that matches your specific attribute pattern
        const updatedTagText = tagText.replace(
          new RegExp(`\\s${lineIdentifier}=".*?"`, "g"), // Adjust this if the attributes differ
          "" // This will remove the attribute and its value
        );

        if (updatedTagText !== tagText) {
          // Replace the entire tag with the updated one
          const range = new vscode.Range(
            document.positionAt(match.index),
            document.positionAt(match.index + tagText.length)
          );
          edits.push(vscode.TextEdit.replace(range, updatedTagText));
        }
      }

      // Open and apply changes to the document
      const editor = await vscode.window.showTextDocument(document, {
        preview: false,
      });
      await editor.edit((editBuilder) => {
        edits.forEach((edit) => {
          editBuilder.replace(edit.range, edit.newText);
        });
      });

      saveActiveFileEditor(document);
    }

    console.log("Revert actions for all files in src completed");
  }

  async function runActions() {
    let lineIdentifier = context.globalState.get<string>(
      "lineIdentifier",
      "Line_Identifier"
    );
    if (lineIdentifier.trim() === "") {
      lineIdentifier = "LineNumber";
    }
    await revertActions();
    console.log("run actions fn called");

    if (lineIdentifier) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No active editor found");
        return;
      }
      const document = editor.document;
      const text = document.getText();
      const htmlRegex = /<(\w+)(\s[^>]*?)?(\/?)>/g;
      let edits: vscode.TextEdit[] = [];

      let match: RegExpExecArray | null;
      while ((match = htmlRegex.exec(text))) {
        const tagIndex = match.index;
        const line = document.positionAt(tagIndex).line + 1;
        // Add the attribute with line identifier and file path
        const attribute = ` ${lineIdentifier}="${line} Filepath=${getActiveFileName(
          "base"
        )}"`;
        const insertPositionIndex = tagIndex + match[1].length + 1; // Position after <tagName and a space
        const insertPosition = document.positionAt(insertPositionIndex); // Convert index to Position object

        // "Add mode" logic to add the attribute
        edits.push(vscode.TextEdit.insert(insertPosition, attribute));
      }

      // Apply the text edits to the document
      editor.edit((editBuilder) => {
        edits.forEach((edit) => {
          editBuilder.replace(edit.range, edit.newText);
        });
      });
      runCount += 1;
      context.globalState.update("runCount", runCount);
    }
    console.log("run actions fn compleeted");
  }

  async function revertActions() {
    let lineIdentifier = context.globalState.get<string>(
      "lineIdentifier",
      "Line_Identifier"
    );
    if (lineIdentifier.trim() === "") {
      lineIdentifier = "LineNumber";
    }
    console.log("revert actions fn called");
    if (lineIdentifier) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No active editor found");
        return;
      }
      const document = editor.document;
      const text = document.getText();
      const htmlRegex = /<(\w+)(\s[^>]*?)?(\/?)>/g;
      let edits = [];

      let match;
      while ((match = htmlRegex.exec(text))) {
        const tagIndex = match.index;
        const tagText = match[0];
        const updatedTagText = tagText.replace(
          new RegExp(`\\s${lineIdentifier}=".*?"`, "g"),
          ""
        );
        const range = new vscode.Range(
          document.positionAt(tagIndex),
          document.positionAt(tagIndex + tagText.length)
        );
        edits.push(vscode.TextEdit.replace(range, updatedTagText));
      }

      // Apply edits and handle success/failure
      const success = await editor.edit((editBuilder) => {
        edits.forEach((edit) => {
          editBuilder.replace(edit.range, edit.newText);
        });
      });

      if (!success) {
        console.error("Failed to apply edits in revertActions");
        return; // If edits fail, stop further execution
      }
    }
    console.log("revert actions fn call complete");
  }

  function getActiveFileName(type = "relative"): string {
    // get the active editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;

      const fullFileName = document.fileName;

      return type === "relative" ? fullFileName : path.basename(fullFileName); // Use path.basename to extract the file name only (without the path)
    } else {
      return "";
    }
  }

  // main
  const disposable = vscode.commands.registerCommand(
    "uispyidentifier.addDynamicAttributes",
    async () => {
      if (storedLisenceKey) {
        const options = [
          "Run Actions For Current File",
          "Revert Actions For Current File",
          "Run Actions For All Files",
          "Revert Actions For All Files",
          "Change Line Identifier",
          "Sign out",
        ];

        vscode.window
          .showQuickPick(options, { placeHolder: "Choose an option" })
          .then((selectedOption) => {
            switch (selectedOption) {
              case "Run Actions For Current File":
                vscode.window.showInformationMessage(
                  "Running Actions for current file"
                );
                runActions();
                saveActiveEditor();
                break;

              case "Revert Actions For Current File":
                vscode.window.showInformationMessage(
                  "Reverting Actions for current file"
                );
                revertActions();
                saveActiveEditor();
                break;

              case "Sign out":
                context.globalState.update("lisenceKey", undefined).then(() => {
                  vscode.window.showInformationMessage(
                    "You have been signed out."
                  );
                });
                break;

              case "Run Actions For All Files":
                vscode.window.showInformationMessage(
                  "Running extension actions..."
                );
                // revertActions();
                // runActionsForAllEditors();
                runActionsForAllFilesInSrc();
                // Add your logic for extension actions here
                break;

              case "Revert Actions For All Files":
                vscode.window.showInformationMessage(
                  "Reverting extension actions..."
                );
                // revertActions();
                // Add your logic for reverting actions here
                revertActionsForAllFilesInSrc();
                break;

              case "Change Line Identifier":
                vscode.window.showInputBox({
                  placeHolder: `Please provide your new line identifier this will replace the default identifer(${lineIdentifier})`,
                  prompt: "Enter The New Line Identifier Key",
                  validateInput: (value: string) => {
                    console.log("value in change line identifier : ", value);
                    return handleCustomIdentifier(value);
                  },
                  password: false, // If true, masks the input as a password
                  value: "", // Remove default value to make it empty initially
                  ignoreFocusOut: true, // Keeps the input box open even if focus moves elsewhere
                });
                break;

              default:
                vscode.window.showInformationMessage("No action selected.");
                break;
            }
          });
      } else {
        // Show an input box when the button is clicked
        vscode.window
          .showInputBox({
            placeHolder:
              "Please provide the License Key to get access to the extension",
            prompt: "Enter The License Key",
            validateInput: (value: string) => {
              return validatingUser(value);
            },
            password: false, // If true, masks the input as a password
            value: "", // Remove default value to make it empty initially
            ignoreFocusOut: true, // Keeps the input box open even if focus moves elsewhere
          })
          .then((result) => {
            if (result) {
              vscode.window.showInformationMessage(`You entered: ${result}`);
            } else {
              vscode.window.showInformationMessage(
                `Input was cancelled or invalid`
              );
            }
          });
      }
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(statusBarButton); // Ensure the status bar button is managed by VS Code
}

// This method is called when your extension is deactivated
export function deactivate() {}
