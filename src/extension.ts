import * as vscode from "vscode";

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

  // functions
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

  function runActions(mode: boolean = false) {
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
        const attribute = ` ${lineIdentifer}="${line}"`;
        const insertPositionIndex = tagIndex + match[1].length + 1; // Position after <tagName and space
        const insertPosition = document.positionAt(insertPositionIndex); // Convert index to Position object
        if (mode === false) {
          // here revert actions will be implemented i.e remove the lineidentifier
          const tagText = match[0];
          // Regex to remove the added lineidentifier
          const updatedTagText = tagText.replace(
            new RegExp(` ${lineIdentifer}="\\d+"`),
            ""
          );
          // Replace the entire tag with the updated one
          const range = new vscode.Range(
            document.positionAt(match.index),
            document.positionAt(match.index + tagText.length)
          );
          edits.push(vscode.TextEdit.replace(range, updatedTagText));
        } else {
          // If "add mode", add the dynamic attribute
          edits.push(vscode.TextEdit.insert(insertPosition, attribute));
        }
      }
      // Apply the text edits to the document
      editor.edit((editBuilder) => {
        edits.forEach((edit) => {
          editBuilder.replace(edit.range, edit.newText);
        });
      });
    }
    return runCount;
  }

  const disposable = vscode.commands.registerCommand(
    "uispyidentifier.addDynamicAttributes",
    async () => {
      if (storedLisenceKey) {
        const options = [
          "Open website",
          "Send Feedback",
          "Help",
          "Sign out",
          "Run Extension Actions",
          "Revert Extension Actions",
          "Meta Data",
          "Change Line Identifier",
        ];

        vscode.window
          .showQuickPick(options, { placeHolder: "Choose an option" })
          .then((selectedOption) => {
            switch (selectedOption) {
              case "Open website":
                vscode.env.openExternal(
                  vscode.Uri.parse("https://www.w3schools.com/")
                );
                break;

              case "Send Feedback":
                vscode.window.showInformationMessage(
                  "Feedback form not implemented yet!"
                );
                break;

              case "Help":
                vscode.window.showInformationMessage("Help is on the way!");
                break;

              case "Sign out":
                context.globalState.update("lisenceKey", undefined).then(() => {
                  vscode.window.showInformationMessage(
                    "You have been signed out."
                  );
                });
                break;

              case "Run Extension Actions":
                vscode.window.showInformationMessage(
                  "Running extension actions..."
                );
                runActions(true);
                // Add your logic for extension actions here
                break;

              case "Revert Extension Actions":
                vscode.window.showInformationMessage(
                  "Reverting extension actions..."
                );
                runActions(false);
                // Add your logic for reverting actions here
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
