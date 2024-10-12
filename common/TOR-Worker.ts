const ed = await import("https://unpkg.com/@noble/ed25519@2.0.0/index.js");
const base32 = await import("https://cdn.jsdelivr.net/npm/hi-base32@0.5.1/+esm");
await import("https://cdn.jsdelivr.net/npm/js-sha3@0.9.2/src/sha3.min.js");

export type AddressData = {
	address: string;
	public: {
		raw: Uint8Array;
		b64: string;
	};
	private: {
		raw: Uint8Array;
		b64: string;
	};
}

declare const sha3_256: any;
type KeyPair = {
	private: PrivateKey,
	public: PublicKey,
};
class PublicKey {
	constructor(public readonly value: Uint8Array) {}
	toString() {
		return btoa("== ed25519v1-public: type0 ==\x00\x00\x00".concat(String.fromCharCode.apply(null, [...this.value])));
	}
	equals(other: PublicKey) {
		return this.value.join() === other.value.join();
	}
}
class PrivateKey {
	constructor(public readonly value: Uint8Array) {}
	toString() {
		return btoa("== ed25519v1-secret: type0 ==\x00\x00\x00".concat(String.fromCharCode.apply(null,  [...this.value])));
	}
}

async function generateKeys(privateKey = ed.utils.randomPrivateKey()): Promise<KeyPair> {
	const publicKey = await ed.getPublicKeyAsync(privateKey);
	return {
		private: new PrivateKey(privateKey),
		public: new PublicKey(publicKey)
	};
}

function getPublicKey(address: string) {
	if (!/\.onion$/i.test(address) || address.length != 56 + 6)
		throw new Error("Invalid length");
	const base32Encoded = address.substring(0, address.length - 6).toUpperCase();
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
	return new PublicKey(new Uint8Array(publicKey));
}

async function generateOnionV3(keys: KeyPair | Promise<KeyPair> = generateKeys()):Promise<AddressData> {
	keys = await keys;

	const publicKey = keys.public.value;

	const encoder = new TextEncoder();
	const hash = sha3_256.create();
	const version = new Uint8Array([0x03]);
	hash.update(encoder.encode(".onion checksum"));
	hash.update(publicKey);
	hash.update(version);

	const checksum = hash.digest().slice(0, 2);
   
	const decoded = new Uint8Array([...publicKey, ...checksum, ...version]);
	const address = base32.encode(Array.from(decoded)).toLowerCase().concat(".onion");
	const _publicKey = getPublicKey(address);
	if (!keys.public.equals(_publicKey))
		throw new Error("Public key is invalid");
	return {
		address,
		public: {
			raw: keys.public.value,
			b64: keys.public.toString()
		},
		private: {
			raw: keys.private.value,
			b64: keys.private.toString()
		}
	}
}

export async function generateVanityAddress(prefix?: string) {
	let onion = await generateOnionV3();
	while (prefix && !onion.address.startsWith(prefix))
		onion = await generateOnionV3();
	return onion;
}