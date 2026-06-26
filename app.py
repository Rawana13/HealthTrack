import os
import google.generativeai as genai
import gradio as gr
from dotenv import load_dotenv
from prompts import ANALYZE_CRAVING_PROMPT, GENERATE_ALTERNATIVES_PROMPT, FORMAT_RESULTS_PROMPT

load_dotenv()

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")


def _call_gemini(prompt: str) -> str:
    response = model.generate_content(prompt)
    return response.text


def get_healthy_alternative(craving: str) -> str:
    if not craving.strip():
        return "Please enter something you're craving to get started!"

    analysis = _call_gemini(ANALYZE_CRAVING_PROMPT.format(craving=craving))
    recipes = _call_gemini(GENERATE_ALTERNATIVES_PROMPT.format(craving=craving, analysis=analysis))
    formatted = _call_gemini(FORMAT_RESULTS_PROMPT.format(recipes=recipes))
    return formatted


with gr.Blocks(title="Healthy Cravings", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# Healthy Cravings\n### Find healthier alternatives to your favorite cravings")

    with gr.Row():
        craving_input = gr.Textbox(
            label="What are you craving?",
            placeholder="e.g. pizza, mac and cheese, fried chicken",
            lines=1,
            scale=4,
        )

    submit_btn = gr.Button("Get Healthier Alternative", variant="primary")

    output = gr.Markdown(label="Your Healthy Alternatives")

    submit_btn.click(
        fn=get_healthy_alternative,
        inputs=craving_input,
        outputs=output,
    )

    craving_input.submit(
        fn=get_healthy_alternative,
        inputs=craving_input,
        outputs=output,
    )

if __name__ == "__main__":
    demo.launch()
