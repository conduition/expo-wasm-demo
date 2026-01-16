pkg/keyagg_bg.wasm.js: src/*.rs Cargo.toml Makefile
	wasm-pack build --no-opt
	wasm2js --all-features pkg/keyagg_bg.wasm -o pkg/keyagg_bg.wasm.js
	sed -i 's/keyagg_bg.wasm/keyagg_bg.wasm.js/' pkg/keyagg.js
