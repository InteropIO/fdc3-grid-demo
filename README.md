# AG Grid Finance Demo with Typescript and FDC3

This repo has modified the Typescript flavor of the [AG Grid Finance Demo](https://ag-grid.com/example-finance/).

## Getting Started

1. Get a copy of this repo.
  ```
  git clone https://github.com/julianna-ciq/fdc3-ag-grid.git
  cd fdc3-ag-grid
  ```
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`
4. In your browser, go to [[http://localhost:5173/]] to see the grid.
5. Go to the Interop.IO sandbox, and open the App Importer.
6. Provide the AppD entry "http://localhost:5173/appd.json". Click "Load", and your app will appear.

Note: You could also say that the URL of your app is "http://localhost:5173", and provide a custom name. However, if you do this, you won't be able to work with intents. See the intents section below for more details.

## Playing with FDC3

Grid supports:
* Broadcasting `fdc3.instrument` context. This means that every other application on the same channel will know what instrument/ticker/symbol that Grid is looking at, and can update accordingly.
* Listening for `fdc3.instrument` context. This means that if another application on the same channel says it's looking at a particular instrument/ticker/symbol, Grid can update to look at that same instrument.
* Raise a `ViewInstrument` intent. This means that Grid can send a message to one specific application (typically chosen by the end user), regardless of which channel it's on.
* Listen for a `ViewInstrument` intent. This means that when another application wants to send a message to a specific application, Grid can be included as a possible recipient.

Let's look at how to test these features with the Workbench.

### Broadcasting context
1. Once you've opened this app in the Sandbox, you can test that functionality works using FINOS's FDC3 Workbench. Open the FDC3 Workbench (using the Launcher, which opens from the top left button).
2. In the Grid, open the channel selector, and set the channel to the first channel, "Red" (the user-friendly name).
3. In the Workbench, go to the "User Channels" tab, and join the first channel, "fdc3.channel.1" (the technical, under-the-covers name). Make sure to click "Join", so that you see "fdc3.channel.1" under the heading "Current channel".
4. To see what channels have been broadcast, go down to "Add context listener", select "fdc3.instrument", and click the button "Add Listener". You'll see a box appear under Listeners labeled "fdc3.instrument".
5. Go to Grid, and click a row, such as for AT&T. 
6. You'll see the ticker symbol for AT&T appear in the "fdc3.instrument" listener in the Workbench.

You have successfully broadcast a context from Grid, and you've used the Workbench to test that the context can be received.

### Listening to a Context
1. Confirm that Grid is open and on the Red channel, and the FDC3 Workbench is open and joined to the "fdc3.channel.1" channel.
2. On the "User Channels" tab, go to the "Broadcast context" drop down.
3. Select "Instrument Example - AAPL".
4. Click the "Broadcast" button.
5. Grid will display only "AAPL".

You have succesffully broadcast a context from the FDC3 Workbench, and Grid listened and responded to that context.

You can also use the FDC3 Workbench to create custom contexts to broadcast.
1. In the FDC3 Workbench, go to the "Contexts" tab.
2. Click the "Create New Example" button.
3. Give it a name you'll use to find it in the "Broadcast context" drop down. In this case, let's broadcast an instrument with an empty ticker, which we will use to reset the Grid listing. Name = "Instrument - empty"
4. Edit the JSON. Let's use `type: "fdc3.instrument"` and `id: {ticker: ""}`.
5. Click the "Save changes" button.
6. Go back to the "User Channels" tab, and under "Broadcast context", select "Instrument - empty", and click the "Broadcast" button.
7. Notice that Grid now displays all of its rows, instead of just AAPL.

You have successfully broadcast a custom context from the FDC3 Workbench, and Grid listened and responded to that context.

### Listening for an intent
1. In the FDC3 Workbench, go to the "Intents" tab.
2. Under "Raise intent", select Context = "Instrument example - AAPL", and Intent Type = "ViewInstrument".
3. Click the "Raise Intent" button.
4. A window, called an "Intent Resolver", will pop up. You can select "Grid" and click "Action". If you select the "Grid" listed uner "All Available Apps", you'll see a new instance of Grid open in a new window.
5. The Grid instance that you select should filter to showing "AAPL".

You have successfully raised an intent from the Workbench, and Grid listened and respondd to that intent.

### Raising an Intent

Unfortunately, you won't be able to use the Workbench for this task.

In order for intents to be routed to the correct application, all applications must register what intents they listen for. Currently, Grid is registered to listen for the "ViewInstrument" intent, which is why it appears in the Intent Resolver. However, the *Workbench* isn't registered to listen to the "ViewInstrument" intent.

That said, you're not out of luck. The Grid both raises *and listens for* ViewInstrument, so you can use this particular application to test itself.

1. If Grid is still filtered down to just "AAPL", use the Workbench to broadcast an empty instrument. This will reset the application.
2. Go to Grid, and double click a stock, such as ADI.
3. When the Intent Resolver comes up, look under "All Applications", and select "Grid".
4. A new instance of Grid should pop up, and it should filter to display only ADI.

You have successfully raised an intent from Grid, used the Intent Resolver, and opened a second instance of Grid to receive that intent.