import { Path } from "uix/utils/path.ts";
import { UIX } from "uix";
import { spawnThreads, spawnThread } from "unyt_core/threads/threads.ts";

@UIX.template(function(this: MainPage) {
	return <div>
		<div>
			<h2>How many digits of PI to calculate?</h2>
			<input id="inputPiDigits" type={"number"} placeholder={""}/>
			<div onclick={() => this.computePI()} class="button">Compute</div>
			<section class="results"></section>
		</div>
		<div>
			<h2>Multi-Threading with 10 runners</h2>
			<input id="input" type={"number"} placeholder={""}/>
			<div class="button">Compute</div>
			<section class="results"></section>
		</div>
	</div>
})
export class MainPage extends UIX.BaseComponent {
	@id declare inputPiDigits: HTMLInputElement;

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

	override async onDisplay() {
		return;
		const threads = await spawnThreads<typeof import('../Worker.ts')>(new Path('../Worker.ts'), 10);
		const calculations = threads.map(thread => thread.heavyCalculation(1,2));
			
		const result = await Promise.any(calculations);
		console.log(">>", result)
	}
}