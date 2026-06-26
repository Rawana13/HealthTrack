ANALYZE_CRAVING_PROMPT = """You are a nutrition expert. A user is craving: {craving}

Analyze what makes this food unhealthy. Be specific about:
- Processed or refined ingredients
- Excess saturated fat, sodium, or sugar
- Low nutritional density

Keep your analysis to 2-3 concise sentences."""

GENERATE_ALTERNATIVES_PROMPT = """You are a creative healthy recipe developer.

The user craves: {craving}
Here is why it can be unhealthy: {analysis}

Generate exactly 3 healthier alternative recipes that still satisfy this craving. For each recipe provide:
- A creative name
- Why it satisfies the craving (1 sentence)
- Ingredients (bulleted list)
- Simple steps (numbered list, max 5 steps)

Separate each recipe with "---"."""

FORMAT_RESULTS_PROMPT = """You are a friendly food writer. Take these 3 healthy recipes and format them beautifully for display.

Recipes:
{recipes}

Format each recipe clearly with headers and clean spacing. Add a one-line encouraging intro at the top. Keep the tone warm and motivating."""
