pkg/keyagg_bg.wasm.js: src/*.rs Cargo.toml Cargo.lock Makefile
	wasm-pack build
	wasm2js pkg/keyagg_bg.wasm -o pkg/keyagg_bg.wasm.js
	sed -i 's/keyagg_bg.wasm/keyagg_bg.wasm.js/' pkg/keyagg.js
