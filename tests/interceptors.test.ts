// @vitest-environment jsdom
import "whatwg-fetch";

import { beforeEach, describe, expect, test, vi } from "vitest";

import { FetchParams, RequestInterceptor } from "../src/interceptors";

describe("fetch", () => {
  let fetchSpy;

  const handler = vi.fn((request: FetchParams) => Promise.resolve(request));

  beforeEach(() => {
    window.fetch = fetchSpy = vi.fn(() => Promise.resolve(new Response()));
  });

  test("predicate => false", async () => {
    const predicate = vi.fn(() => false);

    const interceptor = new RequestInterceptor(predicate);
    interceptor.addHandler(handler);

    await window.fetch("/", { method: "POST" });

    expect(predicate).toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
  });

  test("predicate => true", async () => {
    const predicate = vi.fn(() => true);

    const interceptor = new RequestInterceptor(predicate);
    interceptor.addHandler(handler);

    await window.fetch("/", { method: "POST" });

    expect(predicate).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
  });
});
