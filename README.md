# CraveSmart

CraveSmart is a single-page web app that helps home cooks find healthier alternatives to their food cravings — powered by Python, Gradio, and the Anthropic Claude API. Enter any craving (e.g. "mac and cheese" or "fried chicken"), and the app runs three chained Claude calls to analyze what makes that food unhealthy, generate three cleaner alternative recipes that still satisfy the craving, and display each with a name, explanation, ingredient list, and simple cooking steps.

## How to run

```bash
pip install -r requirements.txt
# Add your Anthropic API key to .env
echo "ANTHROPIC_API_KEY=sk-..." > .env
python app.py
```

Then open `http://localhost:7860` in your browser.
