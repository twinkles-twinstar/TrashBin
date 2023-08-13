/** 导出功能配置 */
namespace TwinStar.Script.Executable.DumpMethodConfiguration {

	type ArgumentType = 'confirmation' | 'number' | 'integer' | 'size' | 'string' | 'path';

	type ArgumentConfiguration = {
		id: string;
		name: string;
		type: ArgumentType;
		option: null | Array<any>;
		initial: any;
	};

	type MethodConfiguration = {
		id: string;
		name: string;
		argument: Array<ArgumentConfiguration>;
	};

	type MethodGroupConfiguration = {
		id: string;
		name: string;
		item: Array<MethodConfiguration>;
	};

	export function execute(
	): void {
		let result: Array<MethodGroupConfiguration> = [
			'js',
			'json',
			'data',
			'texture',
			'wwise.media',
			'wwise.sound_bank',
			'marmalade.dzip',
			'popcap.zlib',
			'popcap.crypt_data',
			'popcap.reflection_object_notation',
			'popcap.texture',
			'popcap.u_texture',
			'popcap.sexy_texture',
			'popcap.animation',
			'popcap.re_animation',
			'popcap.particle',
			'popcap.trail',
			'popcap.particle_effect',
			'popcap.render_effect',
			'popcap.character_font_widget_2',
			'popcap.package',
			'popcap.resource_stream_group',
			'popcap.resource_stream_bundle',
			'popcap.resource_stream_bundle_patch',
			'pvz2.text_table',
			'pvz2.remote_android_helper',
		].map((group_id) => ({
			id: group_id,
			name: '',
			item: Entry.g_executor_method
				.filter((value) => (value.id.startsWith(`${group_id}.`)))
				.map((method) => ({
					id: method.id,
					name: Executor.query_method_name(method.id),
					argument: record_to_array(method.default_argument, (key, value) => ([key, value] as [string, any]))
						.filter((value) => (!(Entry.g_common_argument as Object).hasOwnProperty(value[0])))
						.map((argument, argument_index) => ({
							id: argument[0],
							name: (() => {
								try {
									return Executor.query_argument_name(method.id, argument[0]);
								} catch (e) {
									return '?';
								}
							})(),
							type: argument[0].endsWith('file') || argument[0].endsWith('directory')
								? 'path'
								: argument[0].endsWith('buffer_size')
									? 'size'
									: '____' as unknown as ArgumentType,
							option: null,
							initial: argument_index === 0 ? '' : null,
						})),
				})),
		}));
		KernelX.JSON.write_fs_js(Home.of(`~/helper/CommandForwarder/MethodConfiguration.json`), result);
		return;
	}

}

TwinStar.Script.Executable.DumpMethodConfiguration.execute();