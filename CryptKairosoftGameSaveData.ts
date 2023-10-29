/** 加/解密开罗游戏的存档文件，密钥是steam_autocloud.vdf文件内的accountid（目前仅适用于 住宅梦物语DX） */
namespace TwinStar.Script.CryptKairosoftGameSaveData {

	function xor(
		data: ArrayBuffer,
		key: ArrayBuffer,
	): ArrayBuffer {
		let plain = data;
		let cipher = new ArrayBuffer(data.byteLength);
		let plain_view = new Uint8Array(plain);
		let cipher_view = new Uint8Array(cipher);
		let key_view = new Uint8Array(key);
		for (let index = 0; index < plain_view.length; ++index) {
			cipher_view[index] = plain_view[index] ^ key_view[index % key_view.length];
		}
		return cipher;
	}

	function encrypt(
		plain_directory: string,
		cipher_directory: string,
		key: bigint,
	): void {
		let file_list = KernelX.FileSystem.list_file(plain_directory).filter((value) => (/^\d{4,4}$/.test(value)));
		if (file_list.length === 0) {
			Console.warning('所选目录为空存档', []);
			return;
		}
		let key_data = new ArrayBuffer(8);
		new BigUint64Array(key_data)[0] = key | (0x01100001n << 32n);
		for (let file of file_list) {
			let plain_c = KernelX.FileSystem.read_file(`${plain_directory}/${file}`);
			let plain = plain_c.value;
			let cipher = xor(plain, key_data);
			KernelX.FileSystem.write_file(`${cipher_directory}/${file}`, cipher);
		}
		return;
	}

	function decrypt(
		cipher_directory: string,
		plain_directory: string,
		key: bigint,
	): void {
		let file_list = KernelX.FileSystem.list_file(cipher_directory).filter((value) => (/^[0-4]+$/.test(value)));
		if (file_list.length === 0) {
			Console.warning('所选目录为空存档', []);
			return;
		}
		if (!file_list.includes('0000')) {
			Console.warning('无效存档', []);
			return;
		}
		// TODO : unsafe
		// if (account_id === null) {
		// 	let cipher_c = KernelX.FileSystem.read_file(`${cipher_directory}/0000`);
		// 	let cipher = cipher_c.value;
		// 	if (cipher.byteLength < 4) {
		// 		throw new Error(`无效存档`);
		// 	}
		// 	account_id = BigInt(new Uint32Array(cipher.slice(0, 4))[0]);
		// 	Console.notify('i', `未提供账号ID，根据存档文件中猜测为：${account_id}`, []);
		// }
		let key_data = new ArrayBuffer(8);
		new BigUint64Array(key_data)[0] = key | (0x01100001n << 32n);
		for (let file of file_list) {
			let cipher_c = KernelX.FileSystem.read_file(`${cipher_directory}/${file}`);
			let cipher = cipher_c.value;
			let plain = xor(cipher, key_data);
			KernelX.FileSystem.write_file(`${plain_directory}/${file}`, plain);
		}
		return;
	}

	export function execute(
	): void {
		Console.information(`请选择需要处理的开罗游戏存档目录`, []);
		let input_directory = Console.path('directory', 'input', null, null);
		let output_directory = `${input_directory}~`;
		Console.information('请输入ID', []);
		let key = Console.integer(null, (value) => (0x0000000000000000n <= value && value <= 0xFFFFFFFFFFFFFFFFn ? null : `必须为64位无符号整数`));
		Console.information('请选择需要进行的操作', []);
		let mode = Console.enumeration(Console.option_string(['encrypt', 'decrypt']), null, null);
		if (mode === 'encrypt') {
			encrypt(input_directory, output_directory, key);
		}
		if (mode === 'decrypt') {
			decrypt(input_directory, output_directory, key);
		}
		return;
	}

}

TwinStar.Script.CryptKairosoftGameSaveData.execute();