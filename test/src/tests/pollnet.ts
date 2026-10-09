import { assertEq, test } from "@noita-ts/base/test";
import { HttpResponse } from "@noita-ts/pollnet";

test("a pollnet header value keeps its own separators", () => {
  const response = new HttpResponse(200, "Link: <a>; rel: b\nbroken\n: c", "");
  const headers = response.parseHeaders();
  assertEq(headers["Link"], "<a>; rel: b", "the value of Link");
  assertEq(headers[""], undefined, "the value without a name");
});
