Patch to fix "Module parse failed: Unexpected token" error when building using babel-loader. Issue is caused because of an error parsing export-as-namespace syntax in @dfinity libs.

node_modules/ contains patched @dfinity libs. To apply patch, copy node_modules into project root directory.
