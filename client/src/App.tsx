import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Leaderboard, MultiGame, SoloGame, Welcome } from "./pages";
import NotFound from "./pages/NotFound";
import { BASE_URL } from "./utils/constants";

const router = createBrowserRouter([
  { path: "/", element: <Welcome /> },
  { path: "/solo/:playerName", element: <SoloGame /> },
  { path: "/:room_id/:playerName", element: <MultiGame /> },
  { path: "/leaderboard", element: <Leaderboard /> },
  { path: "*", element: <NotFound /> },
]);

const App = () => {
  useEffect(() => {
    // Wake up the backend server (useful for free tier hosting like Render)
    fetch(`${BASE_URL}/api/healthz`).catch(() => {
      // Ignore errors, the goal is just to wake up the server
    });
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
