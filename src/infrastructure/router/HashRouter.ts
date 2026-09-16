/**
 * ============================================================================
 * HashRouter.ts - ハッシュ方式ルーター (Infrastructure Layer)
 * ============================================================================
 * 
 * GitHub Pages およびローカルの file:// プロトコル直接実行の両方で、
 * ページのリロードなしで画面切り替えを実現するルーター。
 */

export type RouteHandler = (params: Record<string, string>) => void;

export class HashRouter {
  private routes: Map<string, RouteHandler> = new Map();
  private defaultRoute: string = 'portal';

  constructor() {
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  public register(route: string, handler: RouteHandler): void {
    this.routes.set(route, handler);
  }

  public setDefault(route: string): void {
    this.defaultRoute = route;
  }

  public navigate(route: string): void {
    window.location.hash = `#${route}`;
  }

  public init(): void {
    this.handleHashChange();
  }

  public getCurrentRoute(): string {
    const hash = window.location.hash.slice(1);
    return hash || this.defaultRoute;
  }

  private handleHashChange(): void {
    const current = this.getCurrentRoute();
    const handler = this.routes.get(current) || this.routes.get(this.defaultRoute);
    if (handler) {
      handler({});
    }
  }
}
