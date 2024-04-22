import React from "react";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import Gallery from "./pages/Gallery";
import Upload from "./pages/Upload";
import Layout from "./Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Gallery />,
      },
      {
        path: "upload",
        element: <Upload />,
      },
    ],
  },
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
