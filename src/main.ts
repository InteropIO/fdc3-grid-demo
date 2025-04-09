import {
  type ColDef,
  type GetRowIdParams,
  type GridOptions,
  type GridReadyEvent,
  type ValueFormatterFunc,
  createGrid,
  type ValueGetterParams,
  GridApi,
} from "@ag-grid-community/core";

import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { AdvancedFilterModule } from "@ag-grid-enterprise/advanced-filter";
import { GridChartsModule } from "@ag-grid-enterprise/charts-enterprise";
import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel";
import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { FiltersToolPanelModule } from "@ag-grid-enterprise/filter-tool-panel";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { RichSelectModule } from "@ag-grid-enterprise/rich-select";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { SetFilterModule } from "@ag-grid-enterprise/set-filter";
import { SparklinesModule } from "@ag-grid-enterprise/sparklines";
import { StatusBarModule } from "@ag-grid-enterprise/status-bar";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { getData } from "./data";

import { TickerCellRenderer } from "./cell-renderers/tickerCellRenderer";
import "./style.css";
import "./app.css";

import { type DesktopAgent, getAgent } from "@finos/fdc3";

/* Setup for using io.CB's channel selector widget */
import IOBrowser from "@interopio/browser"
import IOBrowserWidget from "@interopio/widget";
import "@interopio/widget/styles";
const config = {
    libraries: [IOBrowserWidget],
    // Optional configuration for the widget.
    widget: {
      displayInWorkspace: true,
      position: "bottom",
      mode: "compact"
    }
};

// @ts-ignore
IOBrowser(config);

/******** SETUP FOR AG-GRID ************/
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  AdvancedFilterModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  GridChartsModule,
  MenuModule,
  RangeSelectionModule,
  RowGroupingModule,
  SetFilterModule,
  RichSelectModule,
  StatusBarModule,
  SparklinesModule,
]);
const numberFormatter: ValueFormatterFunc = (params) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 2,
  });
  return params.value == null ? "" : formatter.format(params.value);
};
const columnDefs: ColDef[] = [
  {
    field: "ticker",
    cellRenderer: TickerCellRenderer,
    minWidth: 380,
  },
  {
    field: "instrument",
    cellDataType: "text",
    type: "rightAligned",
    maxWidth: 180,
  },
  {
    headerName: "P&L",
    cellDataType: "number",
    type: "rightAligned",
    cellRenderer: "agAnimateShowChangeCellRenderer",
    valueGetter: ({ data }: ValueGetterParams) =>
      data && data.quantity * (data.price / data.purchasePrice),
    valueFormatter: numberFormatter,
    aggFunc: "sum",
  },
  {
    headerName: "Total Value",
    type: "rightAligned",
    cellDataType: "number",
    valueGetter: ({ data }: ValueGetterParams) =>
      data && data.quantity * data.price,
    cellRenderer: "agAnimateShowChangeCellRenderer",
    valueFormatter: numberFormatter,
    aggFunc: "sum",
  },
  {
    field: "quantity",
    cellDataType: "number",
    type: "rightAligned",
    valueFormatter: numberFormatter,
    maxWidth: 150,
  },
  {
    headerName: "Price",
    field: "purchasePrice",
    cellDataType: "number",
    type: "rightAligned",
    valueFormatter: numberFormatter,
    maxWidth: 150,
  },
  {
    field: "purchaseDate",
    cellDataType: "dateString",
    type: "rightAligned",
    hide: true,
  },
  {
    headerName: "Last 24hrs",
    field: "last24",
    cellRenderer: "agSparklineCellRenderer",
    cellRendererParams: {
      sparklineOptions: {
        line: {
          strokeWidth: 2,
        },
      },
    },
  },
];
let rowData = getData();
const gridOptions: GridOptions = {
  rowData,
  getRowId: (params: GetRowIdParams) => params.data.ticker,
  onGridReady(params: GridReadyEvent) {
    const gridApi = params.api;

    setInterval(() => {
      rowData = rowData.map((item) =>
        Math.random() < 0.1
          ? {
              ...item,
              price:
                item.price +
                item.price *
                  ((Math.random() * 4 + 1) / 100) *
                  (Math.random() > 0.5 ? 1 : -1),
            }
          : item
      );

      gridApi.applyTransactionAsync({
        update: rowData,
      });
    }, 1000);
  },
  enableRangeSelection: true,
  rowSelection: "multiple",
  enableCharts: true,
  suppressAggFuncInHeader: true,
  groupDefaultExpanded: -1,

  defaultColDef: {
    flex: 1,
    filter: true,
    enableRowGroup: true,
    enableValue: true,
  },
  columnDefs,

  statusBar: {
    statusPanels: [
      { statusPanel: "agTotalAndFilteredRowCountComponent" },
      { statusPanel: "agTotalRowCountComponent" },
      { statusPanel: "agFilteredRowCountComponent" },
      { statusPanel: "agSelectedRowCountComponent" },
      { statusPanel: "agAggregationComponent" },
    ],
  },
};

/******** FDC3 SETUP *******************/
const wireUpFdc3 = (gridApi: GridApi, fdc3: DesktopAgent) => {
  fdc3.joinUserChannel("fdc3.channel.1");

  // Set visual indicator that FDC3 is available
  document.getElementById("fdc3-indicator")!.style.textDecoration = "none";

  // Browadcast a context when a row is clicked
  gridApi.setGridOption("onRowClicked", ({data}) => {
    console.debug("Row clicked: ", data);
    fdc3.broadcast({
      type: "fdc3.instrument",
      name: data.name,
      id: {
        ticker: data.ticker
      }
    });
  });

  // Raise intent with row is double clicked
  gridApi.setGridOption("onRowDoubleClicked", ({data}) => {
    console.debug("Row clicked: ", data);
    fdc3.raiseIntent("ViewChart", {
      type: "fdc3.instrument",
      name: data.name,
      id: {
        ticker: data.ticker
      }
    })
  });

  /* FDC3: Listen for context; update filters based on context */
  fdc3.addContextListener("fdc3.instrument", (context) => {
    console.debug("Received context: ", context);
    gridApi.setGridOption("quickFilterText", context.id?.ticker ?? "");
  });
  
  /* FDC3: Listen for ViewInstrument intent; update filters based on context */
  fdc3.addIntentListener("ViewChart", (context) => {
    console.debug("Received intent: ", context);
    gridApi.setGridOption("quickFilterText", context.id?.ticker ?? "");
  });
}

/******** Build the page ***************/
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize AG-Grid
  const gridDiv = document.querySelector("#app") as HTMLElement;
  const gridApi = createGrid(gridDiv, gridOptions);

  /* Dev: Enable Clear button  */
  document.getElementById("clear")?.addEventListener("click", () => {
    gridApi.setGridOption("quickFilterText", "");
  });

  // Initialize FDC3 and wire up listeners and methods
  const fdc3 = await getAgent();
  if(fdc3){
    wireUpFdc3(gridApi, fdc3);
  }
});

