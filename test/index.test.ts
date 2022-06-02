import { createCookieSessionStorage } from "@remix-run/server-runtime";
import { FacebookStrategy } from "../src";

describe(FacebookStrategy, () => {
  let verify = jest.fn();
  // You will probably need a sessionStorage to test the strategy.
  let sessionStorage = createCookieSessionStorage({
    cookie: { secrets: ["s3cr3t"] },
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should have the name of the strategy", () => {
    let strategy = new FacebookStrategy({ something: "You may need" }, verify);
    expect(strategy.name).toBe("change-me");
  });

  test.todo("Write more tests to check everything works as expected");
});
