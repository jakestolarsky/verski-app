<svelte:head>
    <title> Verski - Bible lookup done right</title>
    	<meta
		name="description"
		content="Fast, offline-first Bible passage lookup."
	/>
</svelte:head>

<main class="container">
    <header>
        <p>Verski</p>
        <h1>Bible lookup done right</h1>
    </header>

    <form method="get">
        <label for="reference">Bible reference</label>
        <input
            id="reference"
            name="reference"
            type="search"
            placeholder="John 3:16"
            autocomplete="off"
        />
        <button type="submit">Lookup</button>
    </form>

    <section aria-label="passage-heading" aria-live="polite">
        <h2 id="passage-heading">Passage</h2>
        <p>Enter a Bible reference to begin</p>
    </section>
</main>