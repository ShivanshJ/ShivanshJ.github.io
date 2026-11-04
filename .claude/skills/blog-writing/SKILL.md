---
name: blog-writing
description: Writing and editing blog posts in src/content/blog/. Enforces the blog's voice, structure, title conventions, and frontmatter requirements.
---

Invoke this skill whenever writing, drafting, editing, or reviewing any `.mdx` file in `src/content/blog/`.

## Checklist

- [ ] Hook opens with a concrete observation, puzzle, or scene — no throat-clearing
- [ ] Core idea stated in plain words before technical label
- [ ] Analogy or worked example before formal definition
- [ ] Reasoning shown, not just conclusion (first-person is fine when earned)
- [ ] Every sentence moves understanding forward — cut anything that doesn't
- [ ] Title follows one of the four patterns (see below)
- [ ] Frontmatter complete: title, date, description, topic
- [ ] Closing line reframes the post — not a summary, not "In conclusion"
- [ ] Final check: would Feynman approve?

## Voice

Write conversationally but precisely. Contractions fine. Casual asides in parentheses fine. Confident but curious — "this got me perplexed" is good. Occasionally wry. No emojis. No corporate hedging ("it's worth noting that", "arguably", "in a sense"). No LinkedIn cadence.

## Structure

1. **Hook** — one or two sentences: a concrete observation, a puzzle, a scene, or a personal moment
2. **Core idea in plain words** — the Feynman sentence; often its own short paragraph
3. **Mechanism** — reasoning with an analogy or small worked example
4. **Implications or recipe** — numbered list for sequential steps, bullets for parallel items, prose for a continuous argument
5. **Closing line** — one sentence that reframes the whole post, ideally slightly wry or aphoristic

Target: readable in under three minutes. If it runs long, cut a section.

## Formatting

- **Bold** for load-bearing sentences or term introductions. Sparingly.
- *Italics* for single-word emphasis or a technical term on first use.
- Numbered lists for recipes and steps. Bullets for parallel items.
- Inline links only, never footnotes. Link to primary sources.
- Code, IDs, command names in `backticks`.
- One blank line between paragraphs. No horizontal rules mid-post.

## Title patterns

Use one of these four:

1. **Punchy phrase + colon + clarifier** — the phrase is memorable or playful; the clarifier tells you what the post delivers. This is the default.
2. **Wordplay on a familiar idiom** — "A matter of time", "Hypothesis to die for", "An eye for an eye". Bend a known phrase toward the topic.
3. **Tension pair** — "X, not Y" or "The gym, not the agent". The argument is in the title.
4. **Promise of explanation** — "Why REST can't hit 1M req/sec". A specific, testable claim the post will justify.

When proposing titles, offer 3–4 options across different patterns, then briefly justify the pick.

Avoid: generic titles, SEO-bait, titles over ~70 characters, titles that don't hint at the thesis.

## Frontmatter

```yaml
---
title: "..."           # follows title conventions above
date: "YYYY-MM-DD"     # actual publication date — drives sort order
description: "..."     # one or two sentences, no marketing voice
topic: "..."           # lowercase, matches an existing topic where possible
---
```

Do NOT add an `order` field — the schema doesn't accept it.

## What to avoid

- Explaining what the code does when the names already say it
- Multi-paragraph setup before getting to the point
- TL;DR or "key takeaways" blocks — the post should be tight enough not to need one
- Repeating the title's phrasing in the first sentence
- Closing with "In conclusion" or "To summarize"
- Hedging phrases: "it could be argued", "some might say"

## Final check (ask in order)

1. Would Feynman understand this on one read? Would he approve of the analogy?
2. Is there a shorter version that says the same thing? (Usually yes.)
3. Does the title follow one of the four patterns?
4. Does the closing line reframe the post, or just repeat it?
5. Is the `date` correct?

If all five are yes, ship it.
