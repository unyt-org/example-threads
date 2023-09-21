# Example: Threads

This repository demonstrates the concepts of **Single-Threading** and **Multi-Threading** based on [DATEX](https://datex.unyt.org) on the example of calculating the digits of PI and creating a [TOR vanity address](https://community.torproject.org/onion-services/advanced/vanity-addresses/).


## Installation
1. Install the **UIX command line tool** following the [Getting Started](https://docs.unyt.org/manual/uix/getting-started#the-uix-command-line-tool) guide in our documentation.

2. Clone this repository to your local machine:

	```bash
	$ git clone https://github.com/unyt-org/example-threads.git
	```
3. Run the project local
	```bash
	$ uix -wlb --port 8000
	```
4. Navigate to your favourite web browser and open http://localhost:8000 to see everything in action. 

## Structure
This diagram outlines the UIX default project structure.
```
.
└── example-website-screenshot/
    ├── common/
    │   ├── compoments/
    │   │   ├── MainPage.scss   // Main style declaration
    │   │   └── MainPage.tsx    // Main component
    │   ├── PI-Worker.ts        // Worker for PI calculation
    │   └── TOR-Worker.ts       // Worker for TOR address gen
    ├── frontend/
    │   ├── entrypoint.css      // Front-end style declaration
    │   └── entrypoint.tsx      // Front-end entrypoint
    ├── app.dx                  // Endpoint config file
    └── deno.json               // Deno config file
```

## Features
* Threading
* Multiple threads
* Disposing of threads

## Preview
<img src=".github/screenshot.png" width="400">


---

<sub>&copy; unyt 2023 • [unyt.org](https://unyt.org)</sub>
