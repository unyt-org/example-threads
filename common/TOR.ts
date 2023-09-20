// check out https://github.com/paulmillr/ed25519-keygen/blob/main/src/tor.ts
const ed = await import("https://unpkg.com/@noble/ed25519");
const base32 = await import("https://cdn.jsdelivr.net/npm/hi-base32@0.5.1/+esm");
await import("https://cdn.jsdelivr.net/npm/js-sha3@0.9.2/src/sha3.min.js");

type KeyPair = {
  private: Uint8Array,
  public: Uint8Array,
};

const generateKeys = async (privateKey = ed.utils.randomPrivateKey()): Promise<KeyPair> => {
    const publicKey = await ed.getPublicKeyAsync(privateKey); 
    return {
        private: privateKey,
        public: publicKey
    };
}

const getPublicKey = (address: string): Uint8Array => {
    if (!/\.onion$/i.test(address) || address.length != 56 + 6)
        throw new Error("Invalid length");
    const base32Encoded = address.substr(0, address.length - 6).toUpperCase();
    const decoded = base32.decode.asBytes(base32Encoded);
    const version = decoded.at(-1);
    if (version !== 0x03)
        throw new Error("Invalid version");

    const checksum = decoded.slice(decoded.length - 3, decoded.length - 1);
    const publicKey = decoded.slice(0, decoded.length - 3);

    const encoder = new TextEncoder();
    const hash = sha3_256.create();
    hash.update(encoder.encode(".onion checksum"));
    hash.update(publicKey);
    hash.update(new Uint8Array([0x03]));

    const _checksum = hash.digest().slice(0, 2);
    if (checksum.join() !== _checksum.join())
        throw new Error("Checksum is invalid");
    return publicKey;
}

const generateOnionV3 = async (keys: KeyPair | Promise<KeyPair> = generateKeys()) => {
    keys = await keys;
    const encoder = new TextEncoder();
    const hash = sha3_256.create();
    const version = new Uint8Array([0x03]);
    hash.update(encoder.encode(".onion checksum"));
    hash.update(keys.public);
    hash.update(version);

    const checksum = hash.digest().slice(0, 2);
    
    const decoded = new Uint8Array([...keys.public, ...checksum, ...version]);
    const address = base32.encode(Array.from(decoded)).toLowerCase().concat(".onion");
    const _publicKey = getPublicKey(address);
    if (keys.public.join() !== _publicKey.join())
        throw new Error("Public key is invalid");
    return {
        address,
        ...keys
    }
}

export const generateVanityAddress = async (prefix?: string) => {
    let onion = await generateOnionV3();
    while (prefix && !onion.address.startsWith(prefix))
        onion = await generateOnionV3();
    return onion;
}
