// `nts test` loads this file before the files of `tests/`, and the runner
// starts the tests in the order that they are registered.
//
// The release test calls `ffi._release`, which releases everything of the Lua
// state that registered with `ffi.onRelease` (for example the HTTP clients and
// servers of other tests that run at the same time). It is synchronous, so
// when it is registered first, it is done before any other test starts.
import "./tests/release";
