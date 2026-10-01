import * as React from "react";

/*
 * Demos run inside the guide's hash router, so their links mustn't navigate. Pass this
 * as `linkComponent` and wrap the demo in <DemoRoutes> to make the links switch a
 * pretend current page instead.
 */
const RouteContext = React.createContext<{ path: string; go: (href: string) => void }>({ path: "", go: () => {} });

export function useDemoRoute() {
  return React.useContext(RouteContext);
}

export function DemoRoutes({ initial, children }: { initial: string; children: React.ReactNode }) {
  const [path, setPath] = React.useState(initial);
  return <RouteContext.Provider value={{ path, go: setPath }}>{children}</RouteContext.Provider>;
}

export const DemoLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  function DemoLink({ href = "", onClick, ...props }, ref) {
    const { go } = useDemoRoute();
    return (
      <a
        ref={ref}
        href={href}
        onClick={(e) => {
          e.preventDefault();
          go(href);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
