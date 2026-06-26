import gradio as gr
from dotenv import load_dotenv

load_dotenv()

PLACEHOLDER_RESPONSE = """Here are 3 healthier alternatives to satisfy your craving!

---

**Recipe 1: Lighter Twist Classic**
*Why it satisfies:* All the flavors you love, with cleaner ingredients.

**Ingredients:**
- Ingredient A
- Ingredient B
- Ingredient C

**Steps:**
1. Prepare your ingredients.
2. Combine and cook.
3. Serve and enjoy!

---

**Recipe 2: Protein-Packed Version**
*Why it satisfies:* Same comfort, more fuel.

**Ingredients:**
- Ingredient X
- Ingredient Y
- Ingredient Z

**Steps:**
1. Preheat and prep.
2. Mix together.
3. Cook until done.

---

**Recipe 3: Veggie-Forward Option**
*Why it satisfies:* All the texture, none of the guilt.

**Ingredients:**
- Vegetable A
- Vegetable B
- Seasoning C

**Steps:**
1. Chop and season.
2. Sauté or roast.
3. Plate and serve.

---
*(Placeholder response — Claude API integration coming in Layer 2)*"""


def get_healthy_alternative(craving: str) -> str:
    if not craving.strip():
        return "Please enter something you're craving to get started!"
    return PLACEHOLDER_RESPONSE


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
