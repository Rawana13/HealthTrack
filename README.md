# Healthy Cravings

Healthy Cravings is a single-page web app that helps home cooks find healthier alternatives to their food cravings — powered by Python, Gradio, and the Google Gemini API (free tier). Enter any craving (e.g. "mac and cheese" or "fried chicken"), and the app runs three chained AI calls to analyze what makes that food unhealthy, generate three cleaner alternative recipes that still satisfy the craving, and display each with a name, explanation, ingredient list, and simple cooking steps.

## How to run

```bash
pip install -r requirements.txt
# Get a free API key at https://aistudio.google.com/app/apikey (no credit card required)
echo "GOOGLE_API_KEY=your_key_here" > .env
python app.py
```

Then open `http://localhost:7860` in your browser.
