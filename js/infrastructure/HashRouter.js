/**
 * ============================================================================
 * HashRouter.js - ハッシュルーター (Infrastructure Layer)
 * ============================================================================
 */
(function() {
  window.FormalEdu = window.FormalEdu || {};
  window.FormalEdu.Infrastructure = window.FormalEdu.Infrastructure || {};

  class HashRouter {
    constructor() {
      this.routes = new Map();
      this.defaultRoute = 'portal';
      this.currentRoute = '';

      window.addEventListener('hashchange', () => this.handleHashChange());
    }

    register(route, handler) {
      this.routes.set(route, handler);
    }

    setDefault(route) {
      this.defaultRoute = route;
    }

    navigate(route) {
      window.location.hash = `#${route}`;
    }

    getCurrentRoute() {
      const hash = window.location.hash.replace(/^#\/?/, '');
      return hash || this.defaultRoute;
    }

    init() {
      this.handleHashChange();
    }

    handleHashChange() {
      const route = this.getCurrentRoute();
      this.currentRoute = route;
      const handler = this.routes.get(route) || this.routes.get(this.defaultRoute);
      if (handler) {
        handler(route);
      }
    }
  }

  window.FormalEdu.Infrastructure.HashRouter = HashRouter;
})();
