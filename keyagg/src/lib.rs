use k256::PublicKey;
use musig2::KeyAggContext;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub fn aggregate(pubkey_strings: js_sys::Array) -> Result<String, usize> {
    let mut pubkeys: Vec<PublicKey> = Vec::with_capacity(pubkey_strings.length() as usize);
    for (i, key_hex_val) in pubkey_strings.into_iter().enumerate() {
        let key_hex = match key_hex_val.as_string() {
            Some(h) => h,
            None => return Err(i),
        };

        pubkeys.push(parse_pubkey(&key_hex).ok_or(i)?);
    }

    let key_agg_ctx = KeyAggContext::new(pubkeys).unwrap(); // rarely ever can fail
    let aggregated_key: PublicKey = key_agg_ctx.aggregated_pubkey();
    Ok(hex::encode(aggregated_key.to_sec1_bytes()))
}

#[wasm_bindgen]
pub fn is_valid_pubkey(pubkey_hex: &str) -> bool {
    parse_pubkey(pubkey_hex).is_some()
}

fn parse_pubkey(pubkey_hex: &str) -> Option<PublicKey> {
    let mut bytes = [0u8; 33];
    hex::decode_to_slice(pubkey_hex, &mut bytes).ok()?;
    PublicKey::from_sec1_bytes(&bytes).ok()
}

#[wasm_bindgen(start)]
pub fn init() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
