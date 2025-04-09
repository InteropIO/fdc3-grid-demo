# FDC3 Integration with AG-Grid

This repo showcases how to integrate the [FDC3](https://fdc3.finos.org/) for the Web standard into AG-Grid, a popular JavaScript grid component used for building data-driven applications. This example demonstrates how complex, existing applications can be enhanced with FDC3, enabling seamless data exchange between financial applications within a desktop **or** browser environment.

## Using this repo

1. Launch the repo:

```
git clone https://github.com/InteropIO/fdc3-grid-demo
cd fdc3-grid-demo
npm install
npm run dev
```
This will launch the FDC3-enabled grid at the URL [[http://localhost:5173]]

2. Go to the [interop.io sandbox](https://sandbox.cloud.interop.io/) and login.
3. Open the App Importer, and import [[http://localhost:5173]]

The FDC3-enabled grid will open.

From there, you can edit the files in `/src/`. When you save, your changes will automatically refresh within the sandbox. The FDC3-integrations are written in `./src/main.ts`.