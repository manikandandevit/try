import { Routes, Route, Navigate } from "react-router-dom";

import { publicRoutes, ProtectedRoutes } from "./routesConfig";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "../layout/MainLayout";

const getAllProtectedRoutes = (routes = []) => {
  const result = [];

  routes.forEach(route => {
    if (route.path && route.element) {
      result.push(route);
    }

    if (route.children) {
      route.children.forEach(child => {
        if (child.path && child.element) {
          result.push(child);
        }
      });
    }

    if (route.group && route.menus) {
      route.menus.forEach(menu => {
        if (menu.path && menu.element) {
          result.push(menu);
        }

        if (menu.children) {
          menu.children.forEach(child => {
            if (child.path && child.element) {
              result.push(child);
            }
          });
        }
      });
    }
  });

  return result;
};

const AppRouter = () => {
  const allProtectedRoutes = getAllProtectedRoutes(ProtectedRoutes);

  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" replace />} />

      {publicRoutes.map(({ path, element }, index) => (
        <Route
          key={index}
          path={path}
          element={<PublicRoute>{element}</PublicRoute>}
        />
      ))}

      {allProtectedRoutes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={
            <ProtectedRoute permission={route.permission}>
              <MainLayout>{route.element}</MainLayout>
            </ProtectedRoute>
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
};

export default AppRouter;
