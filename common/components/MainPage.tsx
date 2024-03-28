import { template } from "uix/html/template.ts";
import { Component } from "uix/components/Component.ts";
import { spawnThreads, spawnThread } from "unyt_core/threads/threads.ts";
import { always, map } from "unyt_core/functions.ts";
import type { AddressData } from "common/TOR-Worker.ts";

@template(function(this: MainPage) {
	return <div>
		<div id="tor" class={always(()=>this.calculatingAddress?'hidden':'')}>
			<h2>Create TOR Address</h2>
			<input id="torAddress" maxlength="3" type="text" placeholder="Prefix of vanity address" value={this.$.addressPrefix}/>
			<div onclick={() => this.createVanityAddress()} class="button">Compute</div>
			<section class="results">
				{map(this.resultAddresses, (address: AddressData) =>
					<span>
						<a>{address.address}</a>
						<b>Pub: {address.public.b64}</b>
						<b>Priv: {address.private.b64}</b>
					</span>
				)}
			</section>
		</div>
		<div id="pi" class={always(()=>this.calculatingPI?'hidden':'')}>
			<h2>Calculate PI</h2>
			<input id="inputPiDigits" type="number" placeholder="Number of digits" value={this.$.piDigits}/>
			<div onclick={() => this.computePI()} class="button">Compute</div>
			<section class="results">
				{map(this.resultPIs, (pi: string) =>
					<span>{pi}</span>
				)}
			</section>
		</div>
	</div>
})
export class MainPage extends Component {
	
	// reference properties for input values
	@property piDigits = 5;
	@property addressPrefix = "";

	// reference properties for calculation state
	@property calculatingPI = false
	@property calculatingAddress = false

	// arrays containing history of calculated results
	@property resultPIs:string[] = []
	@property resultAddresses:AddressData[] = []

	async createVanityAddress() {
		this.calculatingAddress = true;

		// spawn 10 new threads
		using threads = await spawnThreads<typeof import('../TOR-Worker.ts')>('../TOR-Worker.ts', 10);
		// try to find an address in parallel
		const address = await Promise.any(
			threads.map(thread => thread.generateVanityAddress(this.addressPrefix))
		);
		this.resultAddresses.unshift(address);
		
		this.calculatingAddress = false;
	}

	async computePI() {
		this.calculatingPI = true;

		// spawn a new thread
		using thread = await spawnThread<typeof import('../PI-Worker.ts')>('../PI-Worker.ts');
		// calculate pi in the thread
		const pi = await thread.calculatePI(this.piDigits);
		this.resultPIs.unshift(pi);

		this.calculatingPI = false;
	}
}