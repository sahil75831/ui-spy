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

  // let lineIdentifier = context.globalState.get<string>("lineIdentifier", null);
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
        context.globalState.update("lineIdentifier", "LineNumber");
        return null;
      }

      // Update lineIdentifier with sanitized identifier
      lineIdentifier = sanitizedIdentifier;

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

  async function runActionsForAllFilesInSrc() {
    let lineIdentifier = context.globalState.get<string>(
      "lineIdentifier",
      "LineNumber"
    );
    if (lineIdentifier.trim() === "") {
      lineIdentifier = "LineNumber";
    }

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
        const htmlRegex = /<([a-z][\w\-]*)(\s[^>]*)?(\/?)>/g;

        let edits: vscode.TextEdit[] = [];
        let match: RegExpExecArray | null;

        while ((match = htmlRegex.exec(text))) {
          console.log("match: ", match);
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
      "LineNumber"
    );
    if (lineIdentifier.trim() === "") {
      lineIdentifier = "LineNumber";
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

  async function runActions() {
    try {
      let lineIdentifier = context.globalState.get<string>(
        "lineIdentifier",
        "LineNumber"
      );

      await revertActions();

      // Fallback to default if the identifier is empty
      if (!lineIdentifier || lineIdentifier.trim() === "") {
        lineIdentifier = "LineNumber";
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
      const htmlRegex = /<([a-z][\w\-]*)(\s[^>]*)?(\/?)>/g;

      let edits: vscode.TextEdit[] = [];
      let match: RegExpExecArray | null;

      while ((match = htmlRegex.exec(text))) {
        try {
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

  async function revertActions() {
    try {
      let lineIdentifier = context.globalState.get<string>(
        "lineIdentifier",
        "LineNumber"
      );

      // Handle empty lineIdentifier gracefully
      if (lineIdentifier.trim() === "") {
        lineIdentifier = "LineNumber";
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
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Software Developer Profile</title>
  <style>
    body {
      font-family: cursive;
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      color: #333;
      line-height: 1.6;
      font-size:1rem;
    }
    header {
      background: #282828;
      color: white;
      text-align: center;
      padding: 20px 10px;
    }
    header img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 5px solid #ffffff;
      margin-top: 10px;
    }
    header h1 {
      font-size: 2.5rem;
      margin: 10px 0 5px;
    }
    header p {
      font-size: 1.2rem;
      margin: 0;
    }
    .container {
      max-width: 900px;
      margin: 30px auto;
      padding: 20px;
    }
    section {
      margin-bottom: 40px;
    }
    h2 {
      font-size: 1.8rem;
      color: #0077cc;
      margin-bottom: 15px;
      border-bottom: 2px solid #0077cc;
      display: inline-block;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    ul li {
      margin: 10px 0;
      font-size: 1rem;
    }
    ul li span {
      font-weight: bold;
      color: #0077cc;
    }
    footer {
      background: #282828;
      color: white;
      text-align: center;
      padding: 20px 10px;
      margin-top: 20px;
    }
    footer a {
      color: #ffe082;
      text-decoration: none;
    }
    footer a:hover {
      text-decoration: underline;
    }
    @media (max-width: 768px) {
      header h1 {
        font-size: 2rem;
      }
      header p {
        font-size: 1rem;
      }
      ul li {
        font-size: 0.9rem;
      }
    }
  </style>
</head>
<body>

<header>
  <img src="https://via.placeholder.com/120" alt="Profile Picture">
  <h1>Sahil Sharma</h1>
  <p>Full-Stack Software Developer</p>
</header>

<div class="container">
  <section>
    <h2>About Me</h2>
    <p>
      I am a passionate software developer with expertise in full-stack development, specializing in JavaScript, Python, and modern frameworks. I thrive on solving problems, creating efficient solutions, and building scalable applications.
    </p>
  </section>

  <section>
    <h2>Skills</h2>
    <ul>
      <li><span>Programming Languages:</span> JavaScript, Python, HTML, CSS, SASS, Tailwind</li>
      <li><span>Frameworks & Libraries:</span> Next.js, React.js, Node.js, Express.js, Shadcn UI, Mantine UI</li>
      <li><span>Development Tools:</span> Docker, Postman, Mongoose, Prisma, Git, GitHub, Playwright, BeautifulSoup</li>
      <li><span>Databases:</span> MongoDB</li>
      <li><span>Other Skills:</span> Chrome Extension Development, Web Automation, Web Scraping</li>
    </ul>
  </section>

  <section>
    <h2>Contact</h2>
    <ul>
      <li><span>Email:</span> <a href="mailto:sahilsharma88765@gmail.com">sahilsharma88765@gmail.com</a></li>
      <li><span>Phone:</span> <a href="tel:+9999026845">9999026845</a></li>
      <li><span>GitHub:</span> <a href="https://github.com/sahil75831" target="_blank">github.com/sahil75831</a></li>
      <li><span>LinkedIn:</span> <a href="https://linkedin.com/in/sahil-sharma-ss9043283" target="_blank">linkedin.com/in/sahil-sharma-ss9043283</a></li>
      <li><span>Medium:</span> <a href="https://medium.com/@sahilsharma_SoftwareDeveloper" target="_blank">medium.com/@sahilsharma_SoftwareDeveloper</a></li>
    </ul>
  </section>
</div>

<footer>
  <p>&copy; 2024 Sahil Sharma | <a href="mailto:sahilsharma88765@gmail.com">Contact Me</a></p>
</footer>

</body>
</html>

`;
  }

  function aboutExtension() {
    const extensionDocumentation = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Extension Documentation</title>
      <style>
        body {
          font-family: 'Dancing Script', cursive;
          line-height: 1.8;
          margin: 0;
          padding: 0;
          background-color: #FFFFFF;
          color: #333;
          font-size:1rem;
        }
        header {
          background-color: #282828;
          color: white;
          padding: 30px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        header h1 {
          margin: 0;
          font-size: 3rem;
        }
        header p {
          margin: 5px 0;
          font-size: 1.2rem;
        }
        .container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 30px;
          background: white;
          border-radius: 0px;
        }
        section {
          margin-bottom: 40px;
        }
        section h2 {
          font-size: 2rem;
          color: #0077cc;
          border-bottom: 2px solid #0077cc;
          display: inline-block;
          margin-bottom: 20px;
        }
        section ul {
          list-style: none;
          padding: 0;
        }
        section ul li {
          margin: 15px 0;
          font-size: 1.1rem;
        }
        section ul li span {
          font-weight: bold;
          color: #0077cc;
        }
        footer {
          text-align: center;
          padding: 20px;
          background-color: #282828;
          color: white;
          margin-top: 40px;
        }
        footer p {
          margin: 0;
          font-size: 1rem;
        }
        .note {
          font-style: italic;
          background-color: #f2f2f2;
          padding: 10px;
          border-radius: 8px;
          margin-top: 15px;
        }
        .workflow {
          background-color: #f9f9f9;
          border-left: 5px solid #0077cc;
          padding-left: 15px;
          margin-top: 20px;
        }
        .workflow p {
          font-size: 1.1rem;
        }
        .workflow ul {
          padding-left: 20px;
        }
        .workflow li {
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
    
    <header>
      <h1>Extension Documentation</h1>
      <p>Step-by-Step Guide to Use the Extension</p>
    </header>
    
    <div class="container">
      <section>
        <h2>Installation</h2>
        <p>The Chrome Extension is mandatory for this tool to function correctly. Please install it first before proceeding with the usage instructions.</p>
        <ul>
          <li><span>Chrome Extension:</span>
            <ul>
              <li>Download the Chrome Extension folder from the repository.</li>
              <li>Open Chrome and navigate to <code>chrome://extensions/</code>.</li>
              <li>Enable <b>Developer Mode</b> (toggle in the top-right corner).</li>
              <li>Click <b>Load unpacked</b> and select the extension folder.</li>
            </ul>
          </li>
          <li><span>VS Code Extension:</span>
            <ul>
              <li>Download the VS Code Extension folder from the repository.</li>
              <li>In VS Code, go to the <b>Extensions</b> panel (<code>Ctrl+Shift+X</code>).</li>
              <li>Click the three-dot menu and select <b>Install from VSIX...</b>.</li>
              <li>Select the downloaded folder to install.</li>
            </ul>
          </li>
        </ul>
      </section>
    
      <section>
        <h2>Features</h2>
        <ul>
          <li><span>1. Run Actions for Current File:</span> Activates the extension only for the currently opened file. Hovering over any UI element will show its source file and line number.</li>
          <li><span>2. Run Actions for All Files:</span> Activates the extension for all files in the \`src\` directory, allowing full project analysis.</li>
          <li><span>3. Revert Actions for Current File:</span> Undo changes made by the extension only for the currently opened file.</li>
          <li><span>4. Revert Actions for All Files:</span> Undo all actions made by the extension across the entire project.</li>
          <li><span>5. Sign Out:</span> Sign out from the extension.</li>
          <li><span>6. About Developer:</span> Displays information about the developer.</li>
        </ul>
      </section>
    
      <section>
        <h2>Usage</h2>
        <ul>
          <li><span>Run Actions for Current File:</span> Open the file in VS Code, click the option to activate, and then hover over UI elements in Chrome to reveal their corresponding source file and line number.</li>
          <li><span>Run Actions for All Files:</span> Click this option to enable the feature for all files in the \`src\` directory.</li>
          <li><span>Revert Actions for Current File:</span> Use this option to undo actions only for the file you're currently working on.</li>
          <li><span>Revert Actions for All Files:</span> Use this option to revert changes made across the entire project.</li>
        </ul>
      </section>
    
      <section class="note">
        <h2>Note</h2>
        <p>To achieve the best results, it is highly recommended to install both the Chrome Extension and the VS Code Extension. The Chrome Extension is necessary for the UI element identification, and the VS Code Extension ensures the functionality works seamlessly in the development environment.</p>
      </section>
    
      <section class="workflow">
        <h2>Workflow</h2>
        <p>Here's how the workflow should look when using the extension:</p>
        <ul>
          <li><b>Step 1:</b> Install both the Chrome Extension and the VS Code Extension.</li>
          <li><b>Step 2:</b> Open your project in VS Code and select one of the actions (either for the current file or all files).</li>
          <li><b>Step 3:</b> In Chrome, hover over any UI element. The source file and line number will be displayed.</li>
          <li><b>Step 4:</b> If you wish to revert any action, use the relevant option to undo changes either for the current file or for the entire project.</li>
          <li><b>Step 5:</b> After finishing your work, sign out from the extension.</li>
        </ul>
      </section>
    </div>
    
    <footer>
      <p>&copy; 2024 Sahil Sharma</p>
    </footer>
    
    </body>
    </html>
    `;

    return extensionDocumentation;
  }
  // main
  const disposable = vscode.commands.registerCommand(
    "uispyidentifier.addDynamicAttributes",
    async () => {
      if (true || context.globalState.get<string>("lisenceKey", "")) {
        const options = [
          "Run Actions For Current File",
          "Revert Actions For Current File",
          "Run Actions For All Files",
          "Revert Actions For All Files",
          "Change Line Identifier",
          "Sign out",
          "About Developer",
          "About Extension",
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
                        "LineNumber"
                      );
                    }
                  });
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
