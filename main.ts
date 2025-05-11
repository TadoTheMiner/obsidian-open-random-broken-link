interface Settings {
	tag_to_consider_broken: string | null
}

const DEFAULT_SETTINGS: Settings = {
	tag_to_consider_broken: null
}

import { match } from 'assert';
import { App, MetadataCache, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
export default class OpenRandomUnitializedNote extends Plugin {
	settings: Settings;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));
		this.addCommand({
			id: 'open-random-broken-link',
			name: 'Open random broken link',
			callback: () => this.open(),
		})
	}

	async open() {
		const unresolved_links = this.app.metadataCache.unresolvedLinks;
		const unresolved_links_flattened = Object.keys(unresolved_links).flatMap((key: string) => Object.keys(unresolved_links[key])).map(file_path => this.app.vault.create(file_path + '.md', ''));
		const files_with_tag_considered_broken = this.app.vault.getMarkdownFiles().filter(file => this.app.metadataCache.getFileCache(file)?.tags?.find(tag => tag.tag == this.settings.tag_to_consider_broken));
		const index = Math.floor(Math.random() * (unresolved_links_flattened.length + files_with_tag_considered_broken.length));

		
		const file = (index < unresolved_links_flattened.length) ? await unresolved_links_flattened[index] : files_with_tag_considered_broken[index - unresolved_links_flattened.length];
		console.log(unresolved_links_flattened);
		console.log(files_with_tag_considered_broken);
		console.log(index);	
		if(!file) return;
		
		this.app.workspace.getLeaf(false).openFile(file);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: OpenRandomUnitializedNote;

	constructor(app: App, plugin: OpenRandomUnitializedNote) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		
		new Setting(containerEl)
			.setName('Tag to consider broken')
			.setDesc('If you have a tag that marks incomplete files add it here so that the plugin can also open the files with it.')
			.addText(text => text
				.setPlaceholder('Tag')
				.setValue(this.plugin.settings.tag_to_consider_broken ?? '')
				.onChange(async (value) => {
					this.plugin.settings.tag_to_consider_broken = value;
					await this.plugin.saveSettings();
				}));
	}
}
