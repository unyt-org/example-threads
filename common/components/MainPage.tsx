import { template } from "uix/html/template.ts";
import { Component } from "uix/components/Component.ts";
import {
  run,
  spawnThread,
  spawnThreads,
} from "datex-core-legacy/threads/threads.ts";
import type { AddressData } from "common/TOR-Worker.ts";

@template(function (this: MainPage) {
  return (
    <>
      <div id="run" class={this.calculatingPI ? "hidden" : ""}>
        <h2>Use Console</h2>
        <div onclick={() => this.runConsole()} class="button">
          Run in Thread
        </div>
      </div>
      <div id="pi" class={this.calculatingPI ? "hidden" : ""}>
        <h2>Calculate PI</h2>
        <input
          id="inputPiDigits"
          type="number"
          placeholder="Number of digits"
          value={this.piDigits}
        />
        <div onclick={() => this.computePI()} class="button">
          {this.calculatingPI ? "Waiting" : "Calculate"}
        </div>
        <section class="results">
          {this.resultPIs.map((pi) => <span>{pi}</span>)}
        </section>
      </div>
      <div id="tor" class={this.calculatingAddress ? "hidden" : ""}>
        <h2>Create TOR Address</h2>
        <input
          id="torAddress"
          maxlength="3"
          type="text"
          placeholder="Prefix of vanity address"
          value={this.addressPrefix}
        />
        <div onclick={() => this.createVanityAddress()} class="button">
          {this.calculatingAddress ? "Waiting" : "Calculate"}
        </div>
        <section class="results">
          {this.resultAddresses.map((address) => (
            <span>
              <a>{address.address}</a>
              <b>Pub: {address.public.b64}</b>
              <b>Priv: {address.private.b64}</b>
            </span>
          ))}
        </section>
      </div>
    </>
  );
})
export class MainPage extends Component {
  // reference properties for input values
  @property
  piDigits = 5;
  @property
  addressPrefix = "";

  // reference properties for calculation state
  @property
  calculatingPI = false;
  @property
  calculatingAddress = false;

  // arrays containing history of calculated results
  @property
  resultPIs: string[] = [];
  @property
  resultAddresses: AddressData[] = [];

  runConsole() {
    run(() => {
      console.log("Hello, main thread!");
      globalThis.console.log("Hello, worker!");
    });
  }

  async computePI() {
    this.calculatingPI = true;

    // spawn a new thread
    using thread = await spawnThread<typeof import("../PI-Worker.ts")>(
      "../PI-Worker.ts",
    );
    // calculate pi in the thread
    const pi = await thread.calculatePI(this.piDigits);
    this.resultPIs.unshift(pi);

    this.calculatingPI = false;
  }

  async createVanityAddress() {
    this.calculatingAddress = true;

    // spawn 10 new threads
    using threads = await spawnThreads<typeof import("../TOR-Worker.ts")>(
      "../TOR-Worker.ts",
      10,
    );
    // try to find an address in parallel
    const address = await Promise.any(
      threads.map((thread) => thread.generateVanityAddress(this.addressPrefix)),
    );
    this.resultAddresses.unshift(address);

    this.calculatingAddress = false;
  }
}
