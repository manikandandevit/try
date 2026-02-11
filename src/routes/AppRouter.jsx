import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes, ProtectedRoutes } from "./routesConfig";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "../layout/MainLayout";

const getAllProtectedRoutes = (routes = []) => {
  const result = [];

  routes.forEach(route => {
    // normal parent routes
    if (route.path && route.element) {
      result.push(route);
    }

    // children routes
    if (route.children) {
      route.children.forEach(child => {
        if (child.path && child.element) {
          result.push(child);
        }
      });
    }

    // 🔥 GROUP (Masters) MENUS
    if (route.group && route.menus) {
      route.menus.forEach(menu => {
        if (menu.path && menu.element) {
          result.push(menu);
        }

        // nested children inside master menu
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
    <BrowserRouter>
      <Routes>
        {/* -------- Public Routes -------- */}
        {publicRoutes.map(({ path, element }, index) => (
          <Route
            key={index}
            path={path}
            element={<PublicRoute>{element}</PublicRoute>}
          />
        ))}

        {/* -------- Protected Routes (Parent + Submenus) -------- */}

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
        

        {/* {ProtectedRoutes.flatMap((route) => {
          const routes = [];

          if (route.element) {
            routes.push(
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute permission={route.permission}>
                    <MainLayout>{route.element}</MainLayout>
                  </ProtectedRoute>
                }
              />
            );
          }

          if (route.children) {
            route.children.forEach((child) => {
              routes.push(
                <Route
                  key={child.path}
                  path={child.path}
                  element={
                    <ProtectedRoute permission={child.permission}>
                      <MainLayout>{child.element}</MainLayout>
                    </ProtectedRoute>
                  }
                />
              );
            });
          }

          return routes;
        })} */}

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
