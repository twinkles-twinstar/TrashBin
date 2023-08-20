/** 解码 PvZ-2 10.8 Beta 数据包中出现的 rersources.newton 文件 */
namespace TwinStar.Script.Executable.DecodeNewton {

	export function read_string(
		data: ByteStreamView,
	): string {
		let length = data.u32();
		let string = '';
		for (let i = 0; i < length; ++i) {
			string += String.fromCharCode(Number(data.u8()));
		}
		return string;
	}

	export function process(
		data: ByteStreamView,
		pkg: any,
	): void {
		pkg.slot_count = data.u32();
		let groups_count = data.u32();
		pkg.groups = [];
		for (let groups_index = 0; groups_index < groups_count; ++groups_index) {
			let group = {} as any;
			pkg.groups.push(group);
			let group_type = data.u8();
			switch (group_type) {
				case 1n: {
					group.type = 'composite';
					break;
				}
				case 2n: {
					group.type = 'simple';
					break;
				}
				default: {
					throw new Error(`unknown group type ${group_type}`);
				}
			}
			group.res = `${data.u32()}`;
			let subgroups_count = data.u32();
			let resources_count = data.u32();
			assert_test(data.u8() === 1n);
			let group_has_parent = data.u8();
			group.id = read_string(data);
			if (group_has_parent !== 0n) {
				group.parent = read_string(data);
			}
			if (group_type === 1n) {
				assert_test(resources_count === 0n);
				group.subgroups = [];
				for (let subgroups_index = 0; subgroups_index < subgroups_count; ++subgroups_index) {
					let subgroup = {} as any;
					group.subgroups.push(subgroup);
					subgroup.res = `${data.u32()}`;
					subgroup.id = read_string(data);
				}
			}
			if (group_type === 2n) {
				assert_test(subgroups_count === 0n);
				group.resources = [];
				for (let resources_index = 0; resources_index < resources_count; ++resources_index) {
					let resource = {} as any;
					group.resources.push(resource);
					let resource_type = data.u8();
					switch (resource_type) {
						case 1n: {
							resource.type = 'Image';
							break;
						}
						case 2n: {
							resource.type = 'PopAnim';
							break;
						}
						case 3n: {
							resource.type = 'SoundBank';
							break;
						}
						case 4n: {
							resource.type = 'File';
							break;
						}
						case 5n: {
							resource.type = 'PrimeFont';
							break;
						}
						case 6n: {
							resource.type = 'RenderEffect';
							break;
						}
						case 7n: {
							resource.type = 'DecodedSoundBank';
							break;
						}
						default: {
							throw new Error(`unknown resource type ${resource_type}`);
							break;
						}
					}
					resource.slot = data.u32();
					resource.width = data.u32();
					resource.height = data.u32();
					resource.x = data.u32(); // maybe
					resource.y = data.u32(); // maybe
					resource.ax = data.u32();
					resource.ay = data.u32();
					resource.aw = data.u32();
					resource.ah = data.u32();
					resource.cols = data.u32();
					resource.rows = data.u32(); // maybe
					resource.atlas = data.u8() !== 0n; // atlas or runtime
					assert_test(data.u8() === 1n);
					assert_test(data.u8() === 1n);
					let resource_has_parent = data.u8();
					resource.id = read_string(data);
					resource.path = read_string(data);
					if (resource_has_parent !== 0n) {
						resource.parent = read_string(data);
					}
				}
			}
		}
		return;
	}

	export function execute(
	): void {
		Console.information(`please type the input file path (resources.newton)`, []);
		let data_file = Console.path('file', ['in'], null, null);
		let definition_file = `${data_file}.json`;
		let data = KernelX.FileSystem.read_file(data_file);
		let data_stream = new ByteStreamView(data.view().value);
		let definition = {} as any;
		process(data_stream, definition);
		KernelX.JSON.write_fs_js(definition_file, definition);
		Console.success('done', []);
		return;
	}

}

TwinStar.Script.Executable.DecodeNewton.execute();