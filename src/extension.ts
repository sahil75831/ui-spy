import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "uispyidentifier" is now active!'
  );

  // Get runCount from globalState
  let runCount = context.globalState.get<number>("runCount", 0); // Default to 0 if not found
  let lineIdentifier = context.globalState.get<string>(
    "lineIdentifer",
    "Line_Identifier"
  );
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
  let lineIdentifer: string =
    context.globalState.get<string>("lineIdentifer") || "Line_Identifier";

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
    lineIdentifer = newIdentifier;
    console.table({ lineIdentifer });
    context.globalState.update("lineIdentifer", lineIdentifer);
    vscode.window.showInformationMessage(
      `Identifier changed to ${lineIdentifer}`
    );

    // Return null to indicate valid input
    // Or return a string message for invalid input (example validation check)
    if (newIdentifier.trim() === "") {
      return "Identifier cannot be empty";
    }
    return null;
  }

  // //   without file name
  //   function runActions(mode: boolean = false) {
  //     if (lineIdentifer) {
  //       const editor = vscode.window.activeTextEditor;
  //       if (!editor) {
  //         vscode.window.showInformationMessage("No active editor found");
  //         return;
  //       }
  //       const document = editor.document;
  //       const text = document.getText();
  //       const htmlRegex = /<(\w+)(\s[^>]*?)?(\/?)>/g;
  //       let edits: vscode.TextEdit[] = [];

  //       let match: RegExpExecArray | null;
  //       while ((match = htmlRegex.exec(text))) {
  //         const tagIndex = match.index;
  //         const line = document.positionAt(tagIndex).line + 1;
  //         // const attribute = ` ${lineIdentifer}="${line}"`;
  //         const attribute = ` ${lineIdentifer}="${line} Path=${getActiveFileName("base")}"`;

  //         const insertPositionIndex = tagIndex + match[1].length + 1; // Position after <tagName and space
  //         const insertPosition = document.positionAt(insertPositionIndex); // Convert index to Position object
  //         if (mode === false) {
  //           // here revert actions will be implemented i.e remove the lineidentifier
  //           const tagText = match[0];
  //           // Regex to remove the added lineidentifier
  //           const updatedTagText = tagText.replace(
  //             new RegExp(` ${lineIdentifer}="\\d+"`),
  //             ""
  //           );
  //           // Replace the entire tag with the updated one
  //           const range = new vscode.Range(
  //             document.positionAt(match.index),
  //             document.positionAt(match.index + tagText.length)
  //           );
  //           edits.push(vscode.TextEdit.replace(range, updatedTagText));
  //         } else {
  //           // If "add mode", add the dynamic attribute
  //           edits.push(vscode.TextEdit.insert(insertPosition, attribute));
  //         }
  //       }
  //       // Apply the text edits to the document
  //       editor.edit((editBuilder) => {
  //         edits.forEach((edit) => {
  //           editBuilder.replace(edit.range, edit.newText);
  //         });
  //       });
  //     }
  //     return runCount;
  //   }

  async function runActionsForAllFilesInSrc() {
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

    // Get the filename of the previous opened file
    const visibleEditors = vscode.window.visibleTextEditors;
    let prevEditor =
      visibleEditors.length > 1
        ? visibleEditors[visibleEditors.length - 2]
        : null;

    let prevFileName = "";
    if (prevEditor) {
      prevFileName = prevEditor.document.fileName;
      console.log("Previously opened file: ", prevFileName);
    }

    // Loop through each file and apply your function
    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);
      const text = document.getText();

      // Updated regex for lowercase HTML tags
      const htmlRegex =
        /<([a-z][\w\-]*)((?:\s+[\w\-]+(?:="[^"]*")?)*)\s*(\/?)>/g;

      let edits: vscode.TextEdit[] = [];
      let match: RegExpExecArray | null;

      while ((match = htmlRegex.exec(text))) {
        const tagIndex = match.index;
        const line = document.positionAt(tagIndex).line + 1;

        // Generate attribute using the previous opened file name
        const attribute = ` ${lineIdentifer}="${line} Path=${
          path.basename(prevFileName) || path.basename(document.fileName)
        }"`;

        const insertPositionIndex = tagIndex + match[1].length + 1; // Position after <tagName and a space
        const insertPosition = document.positionAt(insertPositionIndex); // Convert index to Position object

        edits.push(vscode.TextEdit.insert(insertPosition, attribute));
      }

      // Open and apply changes to the document
      const editor = await vscode.window.showTextDocument(document, {
        preview: false,
      });
      editor.edit((editBuilder) => {
        edits.forEach((edit) => {
          editBuilder.insert(edit.range.start, edit.newText);
        });
      });

      runCount += 1;
      context.globalState.update("runCount", runCount);

      // Save the editor
      saveActiveFileEditor(document);
    }

    console.log("run actions for all files in src fn completed");
  }

  async function revertActionsForAllFilesInSrc() {
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

    if (!lineIdentifer) {
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
          new RegExp(`\\s${lineIdentifer}=".*?"`, "g"), // Adjust this if the attributes differ
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


  function runActions() {
    console.log("run actions fn called");

    if (lineIdentifer) {
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
        const attribute = ` ${lineIdentifer}="${line} Path=${getActiveFileName(
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

  function revertActions() {
    console.log("revert actions fn called");
    if (lineIdentifer) {
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
        const attribute = ` ${lineIdentifer}="${line} Path=${getActiveFileName(
          "base"
        )}"`;
        const insertPositionIndex = tagIndex + match[1].length + 1; // Position after <tagName and a space
        const insertPosition = document.positionAt(insertPositionIndex); // Convert index to Position object

        // "Revert mode" logic to remove the attribute
        const tagText = match[0];
        // Updated regex to handle lineIdentifer with additional characters or text
        const updatedTagText = tagText.replace(
          new RegExp(`\\s${lineIdentifer}=".*?"`, "g"),
          "" // This will remove the attribute and its value
        );

        // Replace the entire tag with the updated one
        const range = new vscode.Range(
          document.positionAt(match.index),
          document.positionAt(match.index + tagText.length)
        );
        edits.push(vscode.TextEdit.replace(range, updatedTagText));
      }

      // Apply the text edits to the document
      editor.edit((editBuilder) => {
        edits.forEach((edit) => {
          editBuilder.replace(edit.range, edit.newText);
        });
      });
    }
    console.log("revert actions fn call comp;ete");
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

  const disposable = vscode.commands.registerCommand(
    "uispyidentifier.addDynamicAttributes",
    async () => {
      if (storedLisenceKey) {
        const options = [
          "Open website | Send Feedback | Help",
          "Run Actions for current file",
          "Revert Actions for current file",
          "Run Actions for all files",
          "Revert Actions for all files",
          "Change Line Identifier",
          "Meta Data",
          "Sign out",
        ];

        vscode.window
          .showQuickPick(options, { placeHolder: "Choose an option" })
          .then((selectedOption) => {
            switch (selectedOption) {
              case "Open website | Send Feedback | Help":
                vscode.window.showInformationMessage("Help is on the way!");

                vscode.env.openExternal(
                  vscode.Uri.parse("https://www.w3schools.com/")
                );
                break;

              case "Run Actions for current file":
                vscode.window.showInformationMessage(
                  "Running Actions for current file"
                );
                runActions();
                saveActiveEditor();
                break;

              case "Revert Actions for current file":
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

              case "Run Actions for all files":
                vscode.window.showInformationMessage(
                  "Running extension actions..."
                );
                // revertActions();
                // runActionsForAllEditors();
                runActionsForAllFilesInSrc();
                // Add your logic for extension actions here
                break;

              case "Revert Actions for all files":
                vscode.window.showInformationMessage(
                  "Reverting extension actions..."
                );
                // revertActions();
                // Add your logic for reverting actions here
                revertActionsForAllFilesInSrc();
                break;

              case "Meta Data":
                vscode.window
                  .showInputBox({
                    placeHolder: "Enter metadata key",
                    prompt: "Please provide the metadata key",
                    validateInput: (value: string) => {
                      return value ? null : "Metadata key cannot be empty";
                    },
                    password: false,
                    value: "",
                    ignoreFocusOut: true,
                  })
                  .then((firstInput) => {
                    if (firstInput) {
                      // Show the second input box for metadata value
                      vscode.window
                        .showInputBox({
                          placeHolder: "Enter metadata value",
                          prompt: "Please provide the metadata value",
                          validateInput: (value: string) => {
                            return value
                              ? null
                              : "Metadata value cannot be empty";
                          },
                        })
                        .then((secondInput) => {
                          if (secondInput) {
                            vscode.window.showInformationMessage(
                              `You entered MetaData Key: ${firstInput} and MetaData Value: ${secondInput}`
                            );
                          } else {
                            vscode.window.showInformationMessage(
                              "Metadata value input was cancelled or invalid"
                            );
                          }
                        });
                    } else {
                      vscode.window.showInformationMessage(
                        "Metadata key input was cancelled or invalid"
                      );
                    }
                  });
                break;

              case "Change Line Identifier":
                vscode.window.showInputBox({
                  placeHolder: `Please provide your new line identifier this will replace the default identifer(${lineIdentifer})`,
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
