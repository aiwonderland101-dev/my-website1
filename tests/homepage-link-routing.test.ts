import { describe, expect, it } from "vitest";

import { resolveHomepageLink } from "../apps/web/app/homepage/homepage-link-routing";

describe("resolveHomepageLink", () => {
  it("routes protected links through auth when user is unauthenticated", () => {
    const result = resolveHomepageLink({
      href: "/wonder-build",
      requiresAuth: true,
      isAuthenticated: false,
      isAuthLoading: false,
    });

    expect(result).toEqual({
      href: "/public-pages/auth?redirectTo=%2Fwonder-build",
      isDisabled: false,
      showsProtectedIndicator: true,
    });
  });

  it("keeps protected links direct for authenticated users", () => {
    const result = resolveHomepageLink({
      href: "/wonder-build",
      requiresAuth: true,
      isAuthenticated: true,
      isAuthLoading: false,
    });

    expect(result).toEqual({
      href: "/wonder-build",
      isDisabled: false,
      showsProtectedIndicator: true,
    });
  });

  it("disables links while auth is loading", () => {
    const result = resolveHomepageLink({
      href: "/docs",
      requiresAuth: false,
      isAuthenticated: false,
      isAuthLoading: true,
    });

    expect(result).toEqual({
      href: "/docs",
      isDisabled: true,
      showsProtectedIndicator: false,
    });
  });
});
