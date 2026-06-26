import os
import anthropic
import gradio as gr
from dotenv import load_dotenv
from prompts import ANALYZE_CRAVING_PROMPT, GENERATE_ALTERNATIVES_PROMPT, FORMAT_RESULTS_PROMPT

load_dotenv()

client = anthropic.Anthropic()
MODEL = "claude-sonnet-4-6"


def _call_claude(prompt: str, max_tokens: int = 1024) -> str:
    with client.messages.stream(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        message = stream.get_final_message()
    return next((b.text for b in message.content if b.type == "text"), "")


def get_healthy_alternative(craving: str) -> str:
    if not craving.strip():
        return "Please enter something you're craving to get started!"

    analysis = _call_claude(ANALYZE_CRAVING_PROMPT.format(craving=craving), max_tokens=512)
    recipes = _call_claude(
        GENERATE_ALTERNATIVES_PROMPT.format(craving=craving, analysis=analysis),
        max_tokens=2048,
    )
    formatted = _call_claude(FORMAT_RESULTS_PROMPT.format(recipes=recipes), max_tokens=2048)
    return formatted


with gr.Blocks(title="CraveSmart", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# CraveSmart\n### Find healthier alternatives to your favorite cravings")

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
