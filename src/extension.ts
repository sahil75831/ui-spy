// oraganize/barcnh
import * as vscode from "vscode";
import * as path from "path";

const extensionName = "SyncLine";
export function activate(context: vscode.ExtensionContext) {
  console.log(
    `Congratulations, your extension ${extensionName} is now active !`
  );

  // Get runCount from globalState
  let runCount = context.globalState.get<number>("runCount", 0);
  let lineIdentifier = context.globalState.get<string>(
    "lineIdentifier",
    "LineNumber"
  );

  // let lineIdentifier = context.globalState.get<string>("lineIdentifier", null);
  // create a ststau bar button
  const statusBarButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  vscode.window.showInformationMessage(`Hello World from ${extensionName}!`);

  statusBarButton.text = `$(rocket) $(debug-disconnect) ${extensionName}`;
  statusBarButton.tooltip = "Click to Run the Extension";
  statusBarButton.command = "syncLine.addDynamicAttributes";
  statusBarButton.show();

  statusBarButton.backgroundColor = new vscode.ThemeColor("statusBarItem.");

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
    if (!lisenceKey.trim()) {
      return "License Key cannot be empty."; // Handle empty input
    }

    if (lisenceKey === "valid-key") {
      context.globalState.update("lisenceKey", lisenceKey);
      vscode.window.showInformationMessage("User validated successfully");
      return null; // Null indicates the input is valid
    }

    return "License Key is not valid.";
  }

  function handleCustomIdentifier(newIdentifier: string): string | null {
    console.log("handleChgnge lie indetfieer calld 2");
    try {
      // Regular expression to remove spaces and special characters
      const sanitizedIdentifier = newIdentifier.replace(/[^a-zA-Z0-9]/g, "");

      // Check if the sanitized identifier is empty
      if (sanitizedIdentifier.trim() === "") {
        context.globalState.update("lineIdentifier", "data-LineNumber");
        return null;
      }

      // Update lineIdentifier with sanitized identifier
      lineIdentifier = `data-${sanitizedIdentifier}`;

      // Update the global state with the new identifier
      context.globalState.update("lineIdentifier", lineIdentifier);

      // Show information message to the user
      vscode.window.showInformationMessage(
        `Identifier changed to ${lineIdentifier}`
      );
      console.log(`Identifier successfully changed to ${lineIdentifier}`);

      return null;
    } catch (error) {
      // Handle unexpected errors
      vscode.window.showErrorMessage(
        "An unexpected error occurred while changing the identifier."
      );
      console.error("Error in handleCustomIdentifier:", error);
      return null;
    }
  }

  // async function runActionsForAllFilesInSrc() {
  //   let lineIdentifier = context.globalState.get<string>(
  //     "lineIdentifier",
  //     "data-LineNumber"
  //   );
  //   if (lineIdentifier.trim() === "") {
  //     lineIdentifier = "data--LineNumber";
  //   }

  //   try {
  //     await revertActionsForAllFilesInSrc();

  //     // Ensure we have a workspace folder
  //     const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  //     if (!workspaceFolder) {
  //       vscode.window.showInformationMessage("No workspace folder found.");
  //       return;
  //     }

  //     // Construct the absolute path to the src directory within the workspace
  //     const srcDir = path.join(workspaceFolder.uri.fsPath, "src");
  //     const srcUri = vscode.Uri.file(srcDir);

  //     // Ensure the directory exists
  //     try {
  //       const srcStat = await vscode.workspace.fs.stat(srcUri);
  //       if (srcStat.type !== vscode.FileType.Directory) {
  //         vscode.window.showInformationMessage("src is not a directory.");
  //         return;
  //       }
  //     } catch (err) {
  //       vscode.window.showErrorMessage(
  //         "Failed to check the src directory. Please ensure it exists."
  //       );
  //       console.error("Error checking src directory:", err);
  //       return;
  //     }

  //     // Find all files in the src directory (excluding node_modules)
  //     let files: vscode.Uri[];
  //     try {
  //       files = await vscode.workspace.findFiles(
  //         "src/**/*",
  //         "**/node_modules/**"
  //       );
  //     } catch (err) {
  //       vscode.window.showErrorMessage(
  //         "Error finding files in the src directory."
  //       );
  //       console.error("Error finding files:", err);
  //       return;
  //     }

  //     if (files.length === 0) {
  //       vscode.window.showInformationMessage(
  //         "No files found in the src directory."
  //       );
  //       return;
  //     }

  //     // Process each file
  //     for (const file of files) {
  //       let document: vscode.TextDocument;
  //       try {
  //         document = await vscode.workspace.openTextDocument(file);
  //       } catch (err) {
  //         vscode.window.showErrorMessage(`Failed to open file: ${file.fsPath}`);
  //         console.error(`Error opening file ${file.fsPath}:`, err);
  //         continue; // Skip to the next file
  //       }

  //       const text = document.getText();
  //       const htmlRegex = /<([a-z][\w\-]*)(\s[^>]*)?(\/?)>/g;

  //       let edits: vscode.TextEdit[] = [];
  //       let match: RegExpExecArray | null;

  //       while ((match = htmlRegex.exec(text))) {
  //         console.log("match: ", match);
  //         const tagIndex = match.index;
  //         const line = document.positionAt(tagIndex).line + 1;

  //         // Check if the attribute already exists in the tag
  //         const existingAttributeRegex = new RegExp(
  //           `\\s${lineIdentifier}=".*?"`,
  //           "g"
  //         );
  //         if (existingAttributeRegex.test(match[0])) {
  //           // If the attribute is already present, skip adding it again
  //           continue;
  //         }

  //         // Construct the new attribute
  //         const attribute = ` ${lineIdentifier}="${line} Filepath=${path.basename(
  //           document.fileName
  //         )}"`;
  //         const insertPositionIndex = tagIndex + match[1].length + 1;
  //         const insertPosition = document.positionAt(insertPositionIndex);

  //         // Add edit to insert the new attribute
  //         edits.push(vscode.TextEdit.insert(insertPosition, attribute));
  //       }

  //       // Apply the edits if any are found
  //       if (edits.length > 0) {
  //         let editor: vscode.TextEditor;
  //         try {
  //           editor = await vscode.window.showTextDocument(document, {
  //             preview: false,
  //           });
  //         } catch (err) {
  //           vscode.window.showErrorMessage(
  //             `Failed to show text document for file: ${file.fsPath}`
  //           );
  //           console.error(`Error opening editor for file ${file.fsPath}:`, err);
  //           continue; // Skip to the next file
  //         }

  //         let success: boolean;
  //         try {
  //           success = await editor.edit((editBuilder) => {
  //             edits.forEach((edit) => {
  //               editBuilder.insert(edit.range.start, edit.newText);
  //             });
  //           });
  //         } catch (err) {
  //           vscode.window.showErrorMessage(
  //             `Error applying edits to file: ${file.fsPath}`
  //           );
  //           console.error(`Error applying edits for file ${file.fsPath}:`, err);
  //           continue; // Skip to the next file
  //         }

  //         if (success) {
  //           try {
  //             await document.save();
  //             console.log(`File ${document.fileName} saved successfully.`);
  //           } catch (err) {
  //             vscode.window.showErrorMessage(
  //               `Failed to save file: ${file.fsPath}`
  //             );
  //             console.error(`Error saving file ${file.fsPath}:`, err);
  //           }
  //         } else {
  //           console.error(`Failed to apply edits for: ${file.fsPath}`);
  //         }
  //       }
  //     }

  //     console.log("Run actions for all files in src function completed.");
  //   } catch (err) {
  //     vscode.window.showErrorMessage(
  //       "An unexpected error occurred during the process."
  //     );
  //     console.error("Unexpected error:", err);
  //   }
  // }

  async function runActionsForAllFilesInSrc() {
    let lineIdentifier = context.globalState.get<string>(
      "lineIdentifier",
      "data-LineNumber"
    );
    if (lineIdentifier.trim() === "") {
      lineIdentifier = "data--LineNumber";
    }

    const skipTags: string[] = [
      "string",
      "number",
      "boolean",
      "bigint",
      "symbol",
      "undefined",
      "null",
      "object",
      "any",
      "unknown",
      "void",
      "never",
      "svg",
    ];

    try {
      await revertActionsForAllFilesInSrc();

      // Ensure we have a workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showInformationMessage("No workspace folder found.");
        return;
      }

      // Construct the absolute path to the src directory within the workspace
      const srcDir = path.join(workspaceFolder.uri.fsPath, "src");
      const srcUri = vscode.Uri.file(srcDir);

      // Ensure the directory exists
      try {
        const srcStat = await vscode.workspace.fs.stat(srcUri);
        if (srcStat.type !== vscode.FileType.Directory) {
          vscode.window.showInformationMessage("src is not a directory.");
          return;
        }
      } catch (err) {
        vscode.window.showErrorMessage(
          "Failed to check the src directory. Please ensure it exists."
        );
        console.error("Error checking src directory:", err);
        return;
      }

      // Find all files in the src directory (excluding node_modules)
      let files: vscode.Uri[];
      try {
        files = await vscode.workspace.findFiles(
          "src/**/*",
          "**/node_modules/**"
        );
      } catch (err) {
        vscode.window.showErrorMessage(
          "Error finding files in the src directory."
        );
        console.error("Error finding files:", err);
        return;
      }

      if (files.length === 0) {
        vscode.window.showInformationMessage(
          "No files found in the src directory."
        );
        return;
      }

      // Process each file
      for (const file of files) {
        let document: vscode.TextDocument;
        try {
          document = await vscode.workspace.openTextDocument(file);
        } catch (err) {
          vscode.window.showErrorMessage(`Failed to open file: ${file.fsPath}`);
          console.error(`Error opening file ${file.fsPath}:`, err);
          continue; // Skip to the next file
        }

        const text = document.getText();
        // const htmlRegex = /<([a-z][\w\-]*)(\s[^>]*)?(\/?)>/g;
        const htmlRegex = /<([a-z][\w\-]*)(\s[^>]*)?(\/?)>/g;

        let edits: vscode.TextEdit[] = [];
        let match: RegExpExecArray | null;

        while ((match = htmlRegex.exec(text))) {
          const tagName = match[1]; // Extract the tag name

          // Skip tags if the name is in the skipTags list
          if (skipTags.includes(tagName)) {
            continue;
          }

          const tagIndex = match.index;
          const line = document.positionAt(tagIndex).line + 1;

          // Check if the attribute already exists in the tag
          const existingAttributeRegex = new RegExp(
            `\\s${lineIdentifier}=".*?"`,
            "g"
          );
          if (existingAttributeRegex.test(match[0])) {
            // If the attribute is already present, skip adding it again
            continue;
          }

          // Construct the new attribute
          const attribute = ` ${lineIdentifier}="${line} Filepath=${path.basename(
            document.fileName
          )}"`;
          const insertPositionIndex = tagIndex + match[1].length + 1;
          const insertPosition = document.positionAt(insertPositionIndex);

          // Add edit to insert the new attribute
          edits.push(vscode.TextEdit.insert(insertPosition, attribute));
        }

        // Apply the edits if any are found
        if (edits.length > 0) {
          let editor: vscode.TextEditor;
          try {
            editor = await vscode.window.showTextDocument(document, {
              preview: false,
            });
          } catch (err) {
            vscode.window.showErrorMessage(
              `Failed to show text document for file: ${file.fsPath}`
            );
            console.error(`Error opening editor for file ${file.fsPath}:`, err);
            continue; // Skip to the next file
          }

          let success: boolean;
          try {
            success = await editor.edit((editBuilder) => {
              edits.forEach((edit) => {
                editBuilder.insert(edit.range.start, edit.newText);
              });
            });
          } catch (err) {
            vscode.window.showErrorMessage(
              `Error applying edits to file: ${file.fsPath}`
            );
            console.error(`Error applying edits for file ${file.fsPath}:`, err);
            continue; // Skip to the next file
          }

          if (success) {
            try {
              await document.save();
              console.log(`File ${document.fileName} saved successfully.`);
            } catch (err) {
              vscode.window.showErrorMessage(
                `Failed to save file: ${file.fsPath}`
              );
              console.error(`Error saving file ${file.fsPath}:`, err);
            }
          } else {
            console.error(`Failed to apply edits for: ${file.fsPath}`);
          }
        }
      }

      console.log("Run actions for all files in src function completed.");
    } catch (err) {
      vscode.window.showErrorMessage(
        "An unexpected error occurred during the process."
      );
      console.error("Unexpected error:", err);
    }
  }

  async function revertActionsForAllFilesInSrc() {
    let lineIdentifier = context.globalState.get<string>(
      "lineIdentifier",
      "data-LineNumber"
    );
    if (lineIdentifier.trim() === "") {
      lineIdentifier = "data-LineNumber";
    }

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

    // Construct the absolute path to the src directory within the workspace
    const srcDir = path.join(workspaceFolder.uri.fsPath, "src");
    const srcUri = vscode.Uri.file(srcDir);

    // Ensure the src directory exists
    try {
      const srcStat = await vscode.workspace.fs.stat(srcUri);
      if (srcStat.type !== vscode.FileType.Directory) {
        vscode.window.showInformationMessage("src is not a directory.");
        return;
      }
    } catch (err) {
      vscode.window.showErrorMessage("src directory does not exist.");
      return;
    }

    const files = await vscode.workspace.findFiles(
      "src/**/*",
      "**/node_modules/**"
    );
    if (files.length === 0) {
      vscode.window.showInformationMessage(
        "No files found in the src directory."
      );
      return;
    }

    // Loop through each file and apply the revert function
    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);
      const text = document.getText();

      // Regex to find and remove the line identifier attribute
      // const htmlRegex = new RegExp(`(<\\w+)(\\s[^>]*?)?\\s${lineIdentifier}="[^"]*"(.*?)>`, "g");
      const htmlRegex = /<(\w+)(\s[^>]*?)?(\/?)>/g;
      let edits: vscode.TextEdit[] = [];
      let match: RegExpExecArray | null;

      while ((match = htmlRegex.exec(text))) {
        const tagIndex = match.index;

        // Extract the full tag text
        const tagText = match[0];

        // Remove the attribute
        const updatedTagText = tagText.replace(
          new RegExp(`\\s${lineIdentifier}="[^"]*"`, "g"),
          ""
        );

        if (updatedTagText !== tagText) {
          // Replace the entire tag with the updated one
          const range = new vscode.Range(
            document.positionAt(tagIndex),
            document.positionAt(tagIndex + tagText.length)
          );
          edits.push(vscode.TextEdit.replace(range, updatedTagText));
        }
      }

      // Apply changes only if edits are available
      if (edits.length > 0) {
        const editor = await vscode.window.showTextDocument(document, {
          preview: false,
        });
        const success = await editor.edit((editBuilder) => {
          edits.forEach((edit) => {
            editBuilder.replace(edit.range, edit.newText);
          });
        });

        if (success) {
          try {
            await document.save();
            console.log(
              `File ${document.fileName} saved successfully after revert.`
            );
          } catch (err) {
            console.error(`Failed to save file ${document.fileName}:`, err);
          }
        } else {
          console.error(
            `Failed to apply revert edits for: ${document.fileName}`
          );
        }
      }
    }

    console.log("Revert actions for all files in src completed");
  }

  // async function runActions() {
  //   try {
  //     let lineIdentifier = context.globalState.get<string>(
  //       "lineIdentifier",
  //       "LineNumber"
  //     );

  //     await revertActions();

  //     // Fallback to default if the identifier is empty
  //     if (!lineIdentifier || lineIdentifier.trim() === "") {
  //       lineIdentifier = "LineNumber";
  //     }

  //     const editor = vscode.window.activeTextEditor;

  //     // Check if an editor is open
  //     if (!editor) {
  //       vscode.window.showInformationMessage(
  //         "No editor open. Please open a file to proceed."
  //       );
  //       return;
  //     }

  //     const document = editor.document;
  //     const text = document.getText();
  //     const htmlRegex = /<([a-z][\w\-]*)(\s[^>]*)?(\/?)>/g;

  //     let edits: vscode.TextEdit[] = [];
  //     let match: RegExpExecArray | null;

  //     while ((match = htmlRegex.exec(text))) {
  //       try {
  //         const tagIndex = match.index;
  //         const line = document.positionAt(tagIndex).line + 1;

  //         // Generate the attribute string
  //         const attribute = ` ${lineIdentifier}="${line} Filepath=${getActiveFileName(
  //           "base"
  //         )}"`;

  //         // Check if the attribute already exists in the tag
  //         const existingAttributeRegex = new RegExp(
  //           `\\s${lineIdentifier}=".*?"`,
  //           "g"
  //         );
  //         if (existingAttributeRegex.test(match[0])) {
  //           // If the attribute already exists, skip adding it again
  //           continue;
  //         }

  //         const insertPositionIndex = tagIndex + match[1].length + 1; // Position after <tagName and a space
  //         const insertPosition = document.positionAt(insertPositionIndex); // Convert index to Position object

  //         // Prepare text edits
  //         edits.push(vscode.TextEdit.insert(insertPosition, attribute));
  //       } catch (innerError) {
  //         console.error("Error processing tag:", innerError);
  //         vscode.window.showErrorMessage(
  //           "An error occurred while processing a tag."
  //         );
  //       }
  //     }

  //     // Apply the text edits to the document
  //     const success = await editor.edit((editBuilder) => {
  //       edits.forEach((edit) => {
  //         editBuilder.insert(edit.range.start, edit.newText);
  //       });
  //     });

  //     // Handle edit success or failure
  //     if (success) {
  //       runCount += 1;
  //       context.globalState.update("runCount", runCount);
  //       vscode.window.showInformationMessage("Action completed successfully.");
  //     } else {
  //       vscode.window.showErrorMessage(
  //         "Failed to apply edits to the document."
  //       );
  //     }
  //   } catch (error) {
  //     console.error("An unexpected error occurred:", error);
  //     vscode.window.showErrorMessage(
  //       "An unexpected error occurred while running actions."
  //     );
  //   }
  // }
  // console.log("date dec 12");

  async function runActions() {
    // Tags to skip
    const skipTags: string[] = [
      "string",
      "number",
      "boolean",
      "bigint",
      "symbol",
      "undefined",
      "null",
      "object",
      "any",
      "unknown",
      "void",
      "never",
      "svg",
    ];

    try {
      let lineIdentifier = context.globalState.get<string>(
        "lineIdentifier",
        "data-LineNumber"
      );

      await revertActions();

      // Fallback to default if the identifier is empty
      if (!lineIdentifier || lineIdentifier.trim() === "") {
        lineIdentifier = "data-LineNumber";
      }

      const editor = vscode.window.activeTextEditor;

      // Check if an editor is open
      if (!editor) {
        vscode.window.showInformationMessage(
          "No editor open. Please open a file to proceed."
        );
        return;
      }

      const document = editor.document;
      const text = document.getText();
      // const htmlRegex = /<([a-z][\w\-]*)(\s[^>]*)?(\/?)>/g;
      const htmlRegex = /<([a-z][\w\-]*)(\s[^>]*)?(\/?)>/g;

      let edits: vscode.TextEdit[] = [];
      let match: RegExpExecArray | null;

      while ((match = htmlRegex.exec(text))) {
        try {
          const tagName = match[1]; // Extract the tag name

          // Skip tags if the name is in the skipTags list
          if (skipTags.includes(tagName)) {
            continue;
          }

          const tagIndex = match.index;
          const line = document.positionAt(tagIndex).line + 1;

          // Generate the attribute string
          const attribute = ` ${lineIdentifier}="${line} Filepath=${getActiveFileName(
            "base"
          )}"`;

          // Check if the attribute already exists in the tag
          const existingAttributeRegex = new RegExp(
            `\\s${lineIdentifier}=".*?"`,
            "g"
          );
          if (existingAttributeRegex.test(match[0])) {
            // If the attribute already exists, skip adding it again
            continue;
          }

          const insertPositionIndex = tagIndex + match[1].length + 1; // Position after <tagName and a space
          const insertPosition = document.positionAt(insertPositionIndex); // Convert index to Position object

          // Prepare text edits
          edits.push(vscode.TextEdit.insert(insertPosition, attribute));
        } catch (innerError) {
          console.error("Error processing tag:", innerError);
          vscode.window.showErrorMessage(
            "An error occurred while processing a tag."
          );
        }
      }

      // Apply the text edits to the document
      const success = await editor.edit((editBuilder) => {
        edits.forEach((edit) => {
          editBuilder.insert(edit.range.start, edit.newText);
        });
      });

      // Handle edit success or failure
      if (success) {
        runCount += 1;
        context.globalState.update("runCount", runCount);
        vscode.window.showInformationMessage("Action completed successfully.");
      } else {
        vscode.window.showErrorMessage(
          "Failed to apply edits to the document."
        );
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      vscode.window.showErrorMessage(
        "An unexpected error occurred while running actions."
      );
    }
  }

  // console.log("date dec 12");
  // async function runActions() {
  //   try {
  //     let lineIdentifier = context.globalState.get<string>("lineIdentifier", "LineNumber");

  //     await revertActions();

  //     // Fallback to default if the identifier is empty
  //     if (!lineIdentifier || lineIdentifier.trim() === "") {
  //       lineIdentifier = "LineNumber";
  //     }

  //     const editor = vscode.window.activeTextEditor;

  //     // Check if an editor is open
  //     if (!editor) {
  //       vscode.window.showInformationMessage(
  //         "No editor open. Please open a file to proceed."
  //       );
  //       return;
  //     }

  //     const document = editor.document;
  //     const text = document.getText();
  //     const htmlRegex = /<([a-z][\w\-])(\s[^>])?(\/?)>/g;

  //     let edits: vscode.TextEdit[] = [];
  //     let match: RegExpExecArray | null;

  //     while ((match = htmlRegex.exec(text))) {
  //       try {
  //         const tagIndex = match.index;
  //         const line = document.positionAt(tagIndex).line + 1;

  //         // Generate the attribute string
  //         const attribute = `${lineIdentifier}="${line} Filepath=${getActiveFileName("base")}"`;

  //         // Check if the attribute already exists in the tag
  //         const existingAttributeRegex = new RegExp(
  //           `\\s${lineIdentifier}=".*?"`, "g"
  //         );
  //         if (existingAttributeRegex.test(match[0])) {
  //           // If the attribute already exists, skip adding it again
  //           continue;
  //         }

  //         const insertPositionIndex = tagIndex + match[1].length + 1; // Position after <tagName and a space
  //         const insertPosition = document.positionAt(insertPositionIndex); // Convert index to Position object

  //         // Prepare text edits
  //         edits.push(vscode.TextEdit.insert(insertPosition, attribute));
  //       } catch (innerError) {
  //         console.error("Error processing tag:", innerError);
  //         vscode.window.showErrorMessage(
  //           "An error occurred while processing a tag."
  //         );
  //       }
  //     }

  //     // Apply the text edits to the document
  //     const success = await editor.edit((editBuilder) => {
  //       edits.forEach((edit) => {
  //         editBuilder.insert(edit.range.start, edit.newText);
  //       });
  //     });

  //     // Handle edit success or failure
  //     if (success) {
  //       runCount += 1;
  //       context.globalState.update("runCount", runCount);
  //       vscode.window.showInformationMessage("Action completed successfully.");
  //     } else {
  //       vscode.window.showErrorMessage(
  //         "Failed to apply edits to the document."
  //       );
  //     }
  //   } catch (error) {
  //     console.error("An unexpected error occurred:", error);
  //     vscode.window.showErrorMessage(
  //       "An unexpected error occurred while running actions."
  //     );
  //   }
  // }

  async function revertActions() {
    try {
      let lineIdentifier = context.globalState.get<string>(
        "lineIdentifier",
        "data-LineNumber"
      );

      // Handle empty lineIdentifier gracefully
      if (lineIdentifier.trim() === "") {
        lineIdentifier = "data-LineNumber";
      }

      const editor = vscode.window.activeTextEditor;

      // Handle case when no editor is open
      if (!editor) {
        vscode.window.showInformationMessage(
          "No editor open. Please open a file to proceed."
        );
        return;
      }

      const document = editor.document;
      const text = document.getText();

      // Check for valid HTML-like structure
      const htmlRegex = /<(\w+)(\s[^>]*?)?(\/?)>/g;
      let edits: vscode.TextEdit[] = [];
      let match: RegExpExecArray | null;

      // Process each match
      while ((match = htmlRegex.exec(text))) {
        try {
          const tagIndex = match.index;
          const tagText = match[0];

          // Handle case when lineIdentifier is not found in the tag
          const updatedTagText = tagText.replace(
            new RegExp(`\\s${lineIdentifier}=".*?"`, "g"),
            ""
          );

          // Ensure that the range and text are valid before applying edits
          const range = new vscode.Range(
            document.positionAt(tagIndex),
            document.positionAt(tagIndex + tagText.length)
          );

          // Push edit for replacement
          edits.push(vscode.TextEdit.replace(range, updatedTagText));
        } catch (innerError) {
          console.error("Error processing tag during revert:", innerError);
          vscode.window.showErrorMessage(
            "An error occurred while processing a tag during revert."
          );
        }
      }

      // Apply edits and check for success
      const success = await editor.edit((editBuilder) => {
        edits.forEach((edit) => {
          editBuilder.replace(edit.range, edit.newText);
        });
      });

      // If applying edits fails, show error message
      if (!success) {
        vscode.window.showErrorMessage(
          "Failed to apply changes to the document."
        );
        console.error("Failed to apply edits in revertActions.");
        return;
      }

      vscode.window.showInformationMessage("Action completed successfully.");
    } catch (error) {
      // Catch any unexpected errors and provide a detailed message
      vscode.window.showErrorMessage(
        "An unexpected error occurred while reverting actions."
      );
      console.error("Error in revertActions:", error);
    }
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

  function aboutDeveloper() {
    const profile = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
    </style>
    <title>Sahil Sharma Resume</title>
    <style>
      body {
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
        display: flex;
        justify-content: center;
        font-family: "Poppins", sans-serif;
        font-weight: 500;
        font-style: normal;
        color:#000000;
      }
      .resume-container {
        background: white;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .header h1 {
        font-size: 40px;
        font-weight: bold;
        letter-spacing: 2px;
        margin: 0;
      }
      .header .contact-info {
        font-size: 14px;
        line-height: 1.2;
        color: #555;
      }
      .header .contact-info a {
        color: #000;
        text-decoration: none;
      }
      .header .contact-info a:hover {
        text-decoration: underline;
      }
      h2 {
        font-size: 20px;
        margin-top: 30px;
        margin-bottom: 10px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .section {
        margin-bottom: 20px;
      }
      .section p {
        margin: 5px 0;
        color: #333;
      }
      .section strong {
        font-weight: bold;
      }
      ul {
        margin: 0;
        padding-left: 20px;
      }
      ul li {
        margin-bottom: 5px;
        color: #333;
      }
      .education p {
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="resume-container">
      <div class="header">
        <h1>Sahil Sharma</h1>
        <div class="contact-info">
          <p>sahilsharma88765@gmail.com</p>
          <p>
            <a href="https://github.com/sahil75831"
              >www.github.com/sahil75831</a
            >
          </p>
          <p>
            <a href="https://www.linkedin.com/in/sahil-sharma-ss9043283"
              >www.linkedin.com/in/sahil-sharma-ss9043283</a
            >
          </p>
          <p>
            <a href="https://medium.com/@sahilsharma_SoftwareDeveloper"
              >https://medium.com/@sahilsharma_SoftwareDeveloper</a
            >
          </p>
        </div>
      </div>

      <div class="section">
        <h2>Professional Experience | 3 Years</h2>

        <p>
          <strong>Full Stack Developer | Current Role</strong>
        </p>
        <p>
          Currently working as a Full Stack Developer, specializing in the
          design, development, and optimization of both front-end and back-end
          systems. I collaborate closely with product teams to create seamless,
          scalable, and secure applications. My role involves integrating
          various technologies to deliver high-performance solutions, while
          ensuring that both the user experience and backend functionality align
          with business requirements.
        </p>
        <br />

        <p>
          <strong>Software Developer | April 2024 - May 2024</strong>
        </p>
        <p>
          Contributed to the successful delivery of multiple software
          development projects, applying a blend of technical skills and
          problem-solving expertise. Worked collaboratively with
          cross-functional teams to analyze user requirements, design efficient
          solutions, and implement them with a focus on quality and timeliness.
        </p>
        <br />

        <p>
          <strong>Software Engineer | August 2023 - April 2024</strong>
        </p>
        <p>
          Played a critical role in the development, maintenance, and
          enhancement of software systems. Partnered with team members across
          different functions to ensure high-quality software delivery,
          addressing complex technical issues, and ensuring seamless integration
          and scalability of features.
        </p>
        <br />

        <p>
          <strong>Full Stack Developer | March 2021 - August 2023</strong>
        </p>
        <p>
          Delivered comprehensive, end-to-end web solutions as a freelance Full
          Stack Developer. My work included designing user-friendly front-end
          interfaces while developing robust back-end functionality. Focused on
          creating custom solutions that addressed client-specific needs,
          improving both the user experience and business outcomes through
          innovative web applications.
        </p>
        <br />
      </div>

      <div class="section">
        <h2>Technical Skills</h2>

        <p>
          <strong>Programming Languages</strong>: JavaScript, TypeScript,
          Kotlin, Python, HTML, CSS, SASS
        </p>

        <p>
          <strong>Frameworks and Libraries</strong>: ReactJS, NextJS, ExpressJS,
          NodeJS, Mantine UI
        </p>

        <p>
          <strong>Development Tools</strong>: Docker, Postman, Prisma, Git,
          Playwright
        </p>

        <p><strong>Databases</strong>: MongoDB, PostgreSQL, Mongoose</p>

        <p>
          <strong>Other Skills</strong>: Chrome Extension Development, Web
          Automation
        </p>
      </div>

      <div class="section">
        <h2>Projects</h2>
        <p><strong>Dynamic Document Automation Suite</strong></p>
        <p>
          Developed a sophisticated document automation platform tailored for
          large-scale organizational needs. This application offers a seamless
          interface for creating, customizing, and managing official documents
          with advanced capabilities, including:
        </p>
        <ul>
          <li>
            Dynamic insertion of pre-designed templates, complete with tables,
            logos, digital signatures, and special formatting elements.
          </li>
          <li>
            Comprehensive text-editing features such as bold, italic,
            strikethrough, and support for multi-page customizations with
            adjustable paper sizes.
          </li>
          <li>
            Effortless addition or deletion of pages, export to PDF
            functionality, and precise alignment with organizational branding
            guidelines.
          </li>
          <li>
            Automated generation of bulk documents, such as salary slips or
            offer letters, for thousands of employees—each dynamically
            personalized with unique credentials.
          </li>
        </ul>
        <p>
          This platform revolutionized document workflows by significantly
          reducing manual efforts while ensuring scalability and accuracy in
          enterprise operations.
        </p>
        <br />
        <p><strong>Marketplace Data Analytics Platform</strong></p>
        <p>
          Led the development of an advanced web application designed to
          aggregate and analyze e-commerce marketplace data. Key features
          include:
        </p>
        <ul>
          <li>
            A robust backend infrastructure built on Node.js and MongoDB,
            leveraging Python for intricate data processing tasks.
          </li>
          <li>
            Automated, brand-specific data extraction utilizing Playwright,
            enhancing data acquisition speed and reliability.
          </li>
          <li>
            Advanced analytical algorithms generating actionable insights,
            including product content scoring, comprehensive sales analyses,
            brand performance evaluation, competitive benchmarking, and
            keyword-based rankings.
          </li>
          <li>
            Scalable integration supporting thousands of API calls, with
            insights visualized through interactive dashboards powered by
            ApexCharts.
          </li>
        </ul>
        <p>
          Additionally, developed a Chrome extension to streamline influencer
          marketing by extracting vital YouTube channel metrics such as
          subscriber count, viewership, and content quality, empowering
          data-driven decision-making and strategic planning.
        </p>
      </div>

      <div class="section">
        <h2>Education</h2>
        <p>
          <strong>Jamia Millia Islamia (New Delhi)</strong> | B.Tech ECE
          (2015-2019) | CPI: 8.83/10
        </p>
        <p>
          <strong>Modern Vidya Niketan Sr. Sec. School</strong> | Percentage
          (12th): 86.40%
        </p>
        <p><strong>Gita Convent School</strong> | CGPA (Class 10): 9.2/10</p>
      </div>
    </div>
  </body>
</html>

    `;

    return profile;
  }

  function aboutExtension() {
    const extensionDocumentation = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
    </style>
    <title>SyncLine Chrome Extension</title>
    <style>
      body {
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
        display: flex;
        justify-content: center;
        font-family: "Poppins", sans-serif;
        font-weight: 500;
        font-style: normal;
        color:#000000;

      }
      .resume-container {
        background: white;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .header h1 {
        font-size: 40px;
        font-weight: bold;
        letter-spacing: 2px;
        margin: 0;
      }
      h2 {
        font-size: 20px;
        margin-top: 30px;
        margin-bottom: 10px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .section {
        margin-bottom: 20px;
      }
      .section p {
        margin: 5px 0;
        color: #333;
      }
      .section strong {
        font-weight: bold;
      }
      ul {
        margin: 0;
        padding-left: 20px;
      }
      ul li {
        margin-bottom: 5px;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="resume-container">
      <div class="header">
        <h1>SyncLine Chrome Extension</h1>
      </div>

      <div class="section">
        <h2>Overview</h2>
        <p>
          SyncLine is a Chrome extension that works in tandem with a VS Code extension to synchronize the <strong>Line Identifier</strong> between both platforms. The Line Identifier is used to map UI elements on the web page to the corresponding code in a VS Code project. When hovering over a UI element in the Chrome browser, a tooltip displays the <strong>Line Identifier</strong> and <strong>file path</strong> of the associated code in VS Code.
        </p>
        <p>
          If you change the Line Identifier in either the Chrome extension or the VS Code extension, it <strong>must be manually updated</strong> in the other; they will not automatically sync.
        </p>
      </div>

      <div class="section">
        <h2>Features</h2>
        <ul>
          <li>
            <strong>Line Identifier Configuration:</strong>
            <ul>
              <li><strong>Chrome Extension:</strong> Users can set a custom Line Identifier via the settings page.</li>
              <li><strong>VS Code Extension:</strong> Users can change the Line Identifier via a Quick Pick menu in VS Code.</li>
              <li>Defaults to <strong>LineNumber</strong> if no custom identifier is provided.</li>
            </ul>
          </li>
          <li>
            <strong>Tooltip on Hover:</strong>
            The Chrome extension detects UI elements on the web page and shows a tooltip displaying the Line Identifier and the file path of the code in VS Code.
          </li>
          <li>
            <strong>Manual Synchronization:</strong>
            If you change the Line Identifier in one extension (VS Code or Chrome), you must manually update it in the other extension for the system to work properly.
          </li>
        </ul>
      </div>

      <div class="section">
        <h2>Installation</h2>
        <h3>1. Edge Extension</h3>
        <ol>
          <li>Go to the Microsoft Edge Add-ons website: <a href="https://microsoftedge.microsoft.com/addons/detail/cocdneokkbcdikodcoadhokiejfonjcp" target="_blank">Edge Extension</a>.</li>
          <li>Search for the "SyncLine" extension.</li>
          <li>Click on the extension to install from the search results. Then, click "Get" to add it to Edge.</li>
          <li>A prompt will appear asking for permission to install the extension. Review the permissions and click "Add Extension" to confirm.</li>
          <li>Once installation is complete, you will see the extension icon in the top-right corner of the browser (next to the address bar).</li>
        </ol>
        <p><strong>Note:</strong> A Chrome version of the extension will be available soon, so stay tuned for that update!</p>

        <h3>2. VS Code Extension</h3>
        <ol>
          <li>Install the VS Code extension from the VS Code Marketplace.</li>
          <li>Open VS Code, and the extension should automatically be added to your workspace.</li>
        </ol>
      </div>

      <div class="section">
        <h2>How to Use</h2>
        <h3>Chrome/Edge Extension</h3>
        <ul>
          <li>Click on the SyncLine icon in the Chrome toolbar to open the popup.</li>
          <li>Type your custom Line Identifier in the settings page (optional).</li>
          <li>When hovering over any UI element in the browser, a tooltip will show the corresponding <strong>Line Identifier</strong> and <strong>file path</strong>.</li>
        </ul>

        <h3>VS Code Extension</h3>
        <ul>
          <li>Open the Command Palette (press Ctrl + Shift + P or Cmd + Shift + P).</li>
          <li>Type the command <strong>SyncLine</strong> to synchronize the Line Identifier with the Chrome extension or run this extension.</li>
          <li>Alternatively, you can click the <strong>SyncLine</strong> button in the VS Code status bar to run this extension.</li>
        </ul>
      </div>
    </div>
  </body>
</html>


    `;

    return extensionDocumentation;
  }
  // main
  const disposable = vscode.commands.registerCommand(
    "syncLine.addDynamicAttributes", // Updated command name
    async () => {
      if (true || context.globalState.get<string>("lisenceKey", "")) {
        const options = [
          "Run Actions For Current File",
          "Revert Actions For Current File",
          "Run Actions For All Files",
          "Revert Actions For All Files",
          "Change Line Identifier",
          "Copy lineIdentifier",
          // "Sign out",
          "About Developer",
          "About Extension",
        ];

        vscode.window
          .showQuickPick(options, { placeHolder: "Choose an option" })
          .then(async (selectedOption) => {
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
                  context.globalState.update("lineIdentifier", undefined);
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
                vscode.window
                  .showInputBox({
                    placeHolder: `Please provide your new line identifier this will replace the identifier ( ${context.globalState.get<string>(
                      "lineIdentifier",
                      "LineNumber"
                    )} )`,
                    prompt: "Enter The New Line Identifier Key",
                    validateInput: (value: string) => {
                      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");

                      console.log("handleChgnge lie indetfieer calld 0");

                      return sanitizedValue !== value
                        ? `Spaces and special characters are not allowed.`
                        : null;
                    },
                    password: false, // If true, masks the input as a password
                    value: "", // Remove default value to make it empty initially
                    ignoreFocusOut: true, // Keeps the input box open even if focus moves elsewhere
                  })
                  .then((inputValue) => {
                    if (inputValue) {
                      handleCustomIdentifier(inputValue);
                    } else {
                      context.globalState.update(
                        "lineIdentifier",
                        "data-LineNumber"
                      );
                    }
                  });
                break;

                case "Copy lineIdentifier":
                  try {
                    // Get the line identifier with a default value
                    const lineIdentifier = context.globalState.get<string>(
                      "lineIdentifier"
                    ) || "data-LineNumber";
                
                    // Use VSCode's clipboard API to copy the text
                    await vscode.env.clipboard.writeText(lineIdentifier);
                
                    // Display the success message
                    vscode.window.showInformationMessage(
                      `${lineIdentifier} has been copied to clipboard!`
                    );
                  } catch (error) {
                    vscode.window.showErrorMessage(
                      "Error copying the line identifier to clipboard."
                    );
                    console.error("Clipboard copy error: ", error);
                  }
                  break;
              case "About Developer":
                const profilePanel = vscode.window.createWebviewPanel(
                  "aboutDeveloper", // Identifier for the webview
                  "About Developer", // Title for the tab
                  vscode.ViewColumn.One, // Show in the first column
                  {} // Webview options (can be extended for scripts, etc.)
                );

                // Set the HTML content for the Webview
                profilePanel.webview.html = aboutDeveloper();
                break;

              case "About Extension":
                const extensionPanel = vscode.window.createWebviewPanel(
                  "aboutExtension", // Identifier for the webview
                  "About Extension", // Title for the tab
                  vscode.ViewColumn.One, // Show in the first column
                  {} // Webview options (can be extended for scripts, etc.)
                );

                // Set the HTML content for the Webview
                extensionPanel.webview.html = aboutExtension();
                break;

              default:
                vscode.window.showInformationMessage("No action selected.");
                break;
            }
          });
      } else {
        vscode.window.showInputBox({
          placeHolder:
            "Please provide the License Key to get access to the extension",
          prompt: "Enter The License Key",
          validateInput: (value: string) => {
            return validatingUser(value); // Use the validatingUser function for input validation
          },
          password: false, // Show the input as plain text
          value: "", // Start with an empty value
          ignoreFocusOut: true, // Keep the input box open even when losing focus
        });
      }
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(statusBarButton); // Ensure the status bar button is managed by VS Code
}

// This method is called when your extension is deactivated
export function deactivate() {}
