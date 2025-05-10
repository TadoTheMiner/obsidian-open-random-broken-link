import { Plugin } from 'obsidian';
export default class OpenRandomUnitializedNote extends Plugin {
	onload() {
		this.addCommand({
			id: 'open-random-broken-link',
			name: 'Open random broken link',
			callback: () => this.open(),
		})
	}

	async open() {
		const unresolved_links = this.app.metadataCache.unresolvedLinks;
		const unresolved_links_flattened = Object.keys(unresolved_links).flatMap((key: string) => Object.keys(unresolved_links[key]));
		const file_path = unresolved_links_flattened[Math.floor(Math.random() * unresolved_links_flattened.length) ];

		if(file_path === undefined) {
			return
		}
		
		const file = await this.app.vault.create(file_path + ".md", "");
		this.app.workspace.getLeaf(false).openFile(file);
	}
}
