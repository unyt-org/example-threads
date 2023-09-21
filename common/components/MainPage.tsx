import { Path } from "uix/utils/path.ts";
import { UIX } from "uix";
import { spawnThreads, spawnThread, disposeThread } from "unyt_core/threads/threads.ts";

@UIX.template(function(this: MainPage) {
	return <div>
		<div class="tor">
			<h2>Multi-Threading TOR Address</h2>
			<input id="torAddress" maxlength={3} type={"text"} placeholder={"Prefix of vanity address"}/>
			<div onclick={() => this.createVanityAddress()} class="button">Compute</div>
			<section class="results"></section>
		</div>
		<div class="pi">
			<h2>How many digits of PI to calculate?</h2>
			<input id="inputPiDigits" type={"number"} placeholder={"Input number"}/>
			<div onclick={() => this.computePI()} class="button">Compute</div>
			<section class="results"></section>
		</div>
	</div>
})
export class MainPage extends UIX.BaseComponent {
	@id declare inputPiDigits: HTMLInputElement;
	@id declare torAddress: HTMLInputElement;

	@standalone
	async createVanityAddress() {
		const parent = this.torAddress.parentElement!;
		if (parent.classList.contains("hidden"))
			return;
		parent.classList.add("hidden");

		const threads = await spawnThreads<typeof import('../TOR.ts')>(new Path('../TOR.ts'), 10);
		const calculations = threads.map(thread => thread.generateVanityAddress(this.torAddress.value));
		const result = await Promise.any(calculations);
		console.log("Found address", result);
		parent.querySelector("section")!.prepend(<span>
			<a>{result.address}</a>
			<b>Pub: {result.public.b64}</b>
			<b>Priv: {result.private.b64}</b>
		</span>)
		parent.classList.remove("hidden");
		disposeThread(...threads);
	}

	@standalone
	async computePI() {
		const parent = this.inputPiDigits.parentElement!;
		if (parent.classList.contains("hidden"))
			return;
		parent.classList.add("hidden");

		const thread = await spawnThread<typeof import('../Worker.ts')>(new Path('../Worker.ts'));
		const pi = await thread.calculatePI(+this.inputPiDigits.value || 10);
		parent.querySelector("section")!.prepend(<span>{pi}</span>)
		parent.classList.remove("hidden");
	}
}