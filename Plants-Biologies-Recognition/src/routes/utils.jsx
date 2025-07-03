export const createRoutes = ({ routes, userRole }) => {
  // const accessRight = {
  //     Admin: ["Dashboard"],
  //     PondOwner: ["Overview"],
  //     Shop: ["ShopOverview"],
  //   };
  let newRoutes = [];
  routes.forEach((route) => {
    if (!route.accessKey || route.accessKey === userRole) {
      newRoutes.push(route);
    }
  });
  return newRoutes;
};
