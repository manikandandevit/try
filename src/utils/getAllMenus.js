export const getAllMenusFromRoutes = (routes) => {
  const menus = [];

  const traverseRoutes = (routeList) => {
    routeList.forEach((route) => {
      if (route.children?.length) {
        route.children.forEach((child) => {
          if (child.showInSidebar) {
            menus.push({
              id: child.path,
              name: child.name,
              permission: child.permission, 
            });
          }
        });
      } else if (route.showInSidebar) {
        menus.push({
          id: route.path,
          name: route.name,
          permission: route.permission,
        });
      }
    });
  };

  traverseRoutes(routes);
  return menus;
};

// export const getAllMenusFromRoutes = (routes) => {
//     const menus = [];

//     const traverseRoutes = (routeList) => {
//         routeList.forEach((route) => {
//             if (route.children && route.children.length > 0) {
//                 const childMenus = route.children.filter((c) => c.showInSidebar);
//                 if (childMenus.length > 0) {
//                     childMenus.forEach((child) => {
//                         menus.push({ id: child.path, name: child.name, permission: route.permission, });
//                     });
//                 } else if (route.showInSidebar) {
//                     menus.push({ id: route.path, name: route.name, permission: route.permission, });
//                 }
//             } else if (route.showInSidebar) {
//                 menus.push({ id: route.path, name: route.name, permission: route.permission });
//             }
//         });
//     };

//     traverseRoutes(routes);
//     return menus;
// };


// // utils/getAllMenus.js
// export const getAllMenusFromRoutes = (routes) => {
//   const menus = [];

//   const traverseRoutes = (routeList) => {
//     routeList.forEach((route) => {
//       if (route.showInSidebar) {
//         menus.push({
//           id: route.path, // can use path as unique id
//           name: route.name,
//         });
//       }
//       if (route.children) {
//         traverseRoutes(route.children);
//       }
//     });
//   };

//   traverseRoutes(routes);

//   return menus;
// };
