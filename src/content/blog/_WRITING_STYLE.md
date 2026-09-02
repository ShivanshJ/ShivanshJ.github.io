# Writing style guide for this blog

Read this before drafting or editing any post in `src/content/blog/`. It captures the voice, structure, and title conventions used across existing posts. Match this style unless the user explicitly overrides it.

## Core principle: Feynman

Every post follows Feynman's principles of explanation:

1. **If you can't explain it simply, you don't understand it.** Rewrite until the core idea fits in one or two plain sentences a smart non-expert could follow. Never hide behind jargon.
2. **Name things in plain words first, technical terms second.** Introduce the concept with an everyday word ("a room that says good or bad"), then attach the technical label ("an environment"). Not the other way around.
3. **Analogy over abstraction.** Reach for a physical, visual, or mechanical analogy before a formal definition. Eyes as cameras. UUIDs as sortable timestamps. Servers as queues.
4. **Show the reasoning, not just the result.** The reader should feel you working it out. First-person ("I was digging into...", "it got me perplexed for quite some time") is welcome when it earns its place.
5. **Cut every sentence that doesn't move understanding forward.** If removing a line doesn't hurt the argument, remove it. Short is almost always better.
6. **No throat-clearing.** Don't open with "In this post I will..." or "Let's explore...". Start with the thing itself — an observation, a question, a scene.

## Voice

- Conversational but precise. Contractions are fine. Casual asides in parentheses are fine.
- Confident but curious. It's okay to say "this got me perplexed" or "I was digging into this" — it signals real engagement, not performance.
- Occasionally wry. A dry closing line ("as Feynman would probably point out, that's usually a sign it's the right thing") lands well. Don't force it.
- No emojis. No corporate hedging ("it's worth noting that", "arguably"). No LinkedIn cadence.
- Second person ("you") is fine when giving a recipe or walking the reader through steps.

## Structure

Typical shape of a post:

1. **Hook** — a concrete observation, a puzzle, a scene, or a personal moment ("I came across X last week"). One or two sentences.
2. **The core idea in plain words** — the Feynman sentence. Often set apart on its own line or as a short paragraph.
3. **Why it matters / the mechanism** — the reasoning, usually with an analogy or a small worked example.
4. **Implications or a recipe** — bulleted or numbered list if there are discrete steps; prose if it's one continuous argument.
5. **A closing line that lands** — one sentence that reframes the whole post, ideally slightly wry or aphoristic. Not a summary.

Length: prefer short. Most posts should be readable in under three minutes. If a post is running long, look for a section to cut, not to pad.

## Formatting conventions

- **Bold** for the load-bearing sentence in a paragraph, or to introduce a term. Use sparingly — if everything is bold, nothing is.
- *Italics* for emphasis on a single word, or for a technical term on first use.
- Numbered lists for recipes and sequential steps. Bulleted lists for parallel items.
- Inline links, never footnotes. Link to primary sources (papers, docs, the actual startup homepage) rather than aggregator posts.
- Code, IDs, and command names in `backticks`.
- One blank line between paragraphs. No horizontal rules mid-post.

## Titles

Titles follow a recognizable pattern across the blog. Study these:

- "An eye for an eye: the speed of sight"
- "UUIDv7: a matter of time"
- "The JSON tax: why REST can't hit 1M req/sec"
- "Hypothesis to die for, an unbiased die?"
- "Probability of success: False uniqueness bias"
- "Optimal server estimate with Markov chains"
- "Hardest logic puzzle: Bottom-up approach"
- "The gym, not the agent: how 2026 startups get labs to call"

Patterns to reuse:

1. **Punchy phrase + colon + clarifier.** The phrase is memorable or slightly playful; the clarifier tells you what the post actually delivers. This is the default shape.
2. **Wordplay or borrowed idiom.** "An eye for an eye", "A matter of time", "Hypothesis to die for". Take a familiar phrase and bend it toward the topic.
3. **Tension pairs.** "X, not Y" or "The gym, not the agent." Sets up the argument in the title itself.
4. **Promise-of-explanation.** "Why REST can't hit 1M req/sec." Names a specific, testable claim the post will justify.

Avoid:

- Generic titles ("Thoughts on RL environments", "A guide to UUIDs").
- SEO-bait ("Everything you need to know about...", "The ultimate guide to...").
- Titles longer than about 70 characters.
- Titles that don't hint at the actual thesis.

When proposing titles, offer 3–4 options in different patterns above, and briefly justify the pick.

## Frontmatter checklist

Every post needs:

```yaml
---
title: "..."           # follows the title conventions above
date: "YYYY-MM-DD"     # actual publication date — this is what drives sort order
description: "..."     # one or two sentences, no marketing voice
topic: "..."           # lowercase, matches an existing topic where possible
---
```

Posts are sorted automatically by `date` (newest first) in `src/components/Desktop.astro`. Do **not** add an `order` field — the schema no longer accepts it, and adding one has no effect.

## What to avoid

- Explaining what the code does when the code and names already say it.
- Multi-paragraph setup before getting to the point.
- Lists of "key takeaways" or "TL;DR" blocks at the top — the post itself should be tight enough not to need one.
- Hedging phrases: "it could be argued", "some might say", "in a sense".
- Repeating the title's phrasing in the first sentence.
- Closing with "In conclusion" or "To summarize".

## Final check before shipping

Ask, in order:

1. Would Feynman understand this on one read? Would he approve of the analogy?
2. Is there a shorter version that says the same thing? (Usually yes.)
3. Does the title follow one of the four patterns above?
4. Does the closing line reframe the post, or just repeat it?
5. Is the `date` correct? (Sort order is driven by date — no manual `order` field needed.)

If all five are yes, ship it.
