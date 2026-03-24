import { createBrowserRouter, RouterProvider } from "react-router";
import { Leaderboard, MultiGame, SoloGame, Welcome } from "./pages";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  { path: "/", element: <Welcome /> },
  { path: "/solo/:playerName", element: <SoloGame /> },
  { path: "/:room_id/:playerName", element: <MultiGame /> },
  { path: "/leaderboard", element: <Leaderboard /> },
  { path: "*", element: <NotFound /> },
]);

const App = () => <RouterProvider router={router} />;

export default App;
