# Example: Threads

This repository demonstrates **Single-Threading** and **Multi-Threading**.


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
We split our code base in [back-end](https://unyt.org/glossary#back-end), [front-end](https://unyt.org/glossary#front-end), and commons folder.
```
.
└── example-website-screenshot/
    ├── common/
    │   ├── compoments/
    │   │   ├── MainPage.scss   // Main style declaration
    │   │   └── MainPage.tsx    // Main component
    │   └── Worker.ts           // Worker
    ├── frontend/
    │   ├── entrypoint.css      // Front-end style declaration
    │   └── entrypoint.tsx      // Front-end entrypoint
    ├── app.dx                  // Endpoint config file
    └── deno.json               // Deno config file
```

## Features
* Threading

## Preview
<img src=".github/screenshot.png" width="400">


## Explanation
*TODO*

---

<sub>&copy; unyt 2023 • [unyt.org](https://unyt.org)</sub>
