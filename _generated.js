// GitHub Commit Log Widget for Scriptable
// Displays a grid of squares for each day of the current month, with a button to mark the current day red (tapped) or green (not tapped)

// File to store tap states
const FILE_PATH = "commit_log.json";
const fm = FileManager.iCloud();

// Get current date
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // 0-based (0 = January)
const currentDay = today.getDate(); // 1-based

// Calculate days in the current month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
const daysInMonth = getDaysInMonth(currentYear, currentMonth);

// Load or initialize tap states
async function loadTapStates() {
  await fm.downloadFileFromiCloud(FILE_PATH);
  if (await fm.fileExists(FILE_PATH)) {
    try {
      const content = await fm.readString(FILE_PATH);
      return JSON.parse(content);
    } catch (e) {
      console.log("Error parsing JSON: " + e);
    }
  }
  // Initialize with empty states
  const states = {};
  for (let day = 1; day <= daysInMonth; day++) {
    states[day] = false; // false means not tapped (green)
  }
  return states;
}

// Save tap states
async function saveTapStates(states) {
  try {
    await fm.writeString(FILE_PATH, JSON.stringify(states));
  } catch (e) {
    console.log("Error saving states: " + e);
  }
}

// Handle tap action
async function handleTap() {
  const args = args.queryParameters;
  if (args.toggle === "true") {
    const states = await loadTapStates();
    states[currentDay] = true; // Mark as tapped (red)
    await saveTapStates(states);
  }
}

// Create the widget
async function createWidget() {
  const states = await loadTapStates();
  
  // Create widget
  let widget = new ListWidget();
  widget.backgroundColor = new Color("#ffffff"); // White background
  
  // Main horizontal stack
  let mainStack = widget.addStack();
  mainStack.layoutHorizontally();
  
  // Left stack for grid
  let gridStack = mainStack.addStack();
  gridStack.layoutVertically();
  
  // Calculate grid layout (e.g., 5 rows for up to 31 days)
  const rows = 5;
  const cols = Math.ceil(daysInMonth / rows);
  
  // Create grid
  for (let row = 0; row < rows; row++) {
    let rowStack = gridStack.addStack();
    rowStack.layoutHorizontally();
    rowStack.spacing = 4;
    
    for (let col = 0; col < cols; col++) {
      const dayIndex = row + col * rows + 1; // 1-based day
      if (dayIndex > daysInMonth) break;
      
      let square = rowStack.addStack();
      square.size = new Size(10, 10);
      
      // Set color based on tap state and current day
      if (dayIndex === currentDay) {
        square.backgroundColor = states[dayIndex] ? new Color("#ff0000") : new Color("#00ff00"); // Red if tapped, green if not
      } else {
        square.backgroundColor = new Color("#e0e0e0"); // Gray for other days
      }
    }
    gridStack.addSpacer(4);
  }
  
  // Add spacer between grid and button
  mainStack.addSpacer();
  
  // Right stack for button
  let buttonStack = mainStack.addStack();
  buttonStack.layoutVertically();
  buttonStack.size = new Size(30, 0); // Fixed width for button
  
  let button = buttonStack.addText("Tap");
  button.font = Font.boldSystemFont(12);
  button.textColor = new Color("#0000ff");
  button.url = Scriptable.URLSchemeForScript("commit_log", { toggle: "true" });
  
  // Set refresh for next day
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  widget.refreshAfterDate = tomorrow;
  
  return widget;
}

// Main execution
async function run() {
  // Handle tap if triggered
  if (args.queryParameters.toggle) {
    await handleTap();
  }
  
  // Create and display widget
  let widget = await createWidget();
  
  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    widget.presentMedium(); // Preview in app
  }
}

// Run the script
run().then(() => Script.complete());