# @noita-ts/pollnet
A [noita-ts](https://github.com/necauqua/noita-ts) package and type definitions for the
[pollnet](https://github.com/probable-basilisk/pollnet) library.

Note that this does not work with generic TypeScriptToLua!

It only contains the 32-bit `pollent.dll` (windows) binary, uses a
noita-specific way of loading it and noita-ts itself bundles it into the final
mod, the vanilla tstl bundler ignores non-lua files.
