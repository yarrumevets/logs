// Encode a JS object after stringifying it.
const encodeObject = (obj) => {
  const objString = JSON.stringify(obj);
  const objEncoded = btoa(
    new TextEncoder()
      .encode(objString)
      .reduce((acc, byte) => acc + String.fromCharCode(byte), "")
  );
  return objEncoded;
};

// Decode the above output. (Untested).
const decodeObject = (encodedObj) => {
  const decoded = new TextDecoder().decode(
    Uint8Array.from(atob(encodedObj), (c) => c.charCodeAt(0))
  );
  const parsedObj = JSON.parse(decoded);
  return parsedObj;
};

export { encodeObject, decodeObject };
