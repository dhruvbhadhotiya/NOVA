from pathlib import Path
from optimum.intel import OVModelForCausalLM
from transformers import AutoTokenizer
import torch

# Set base model path
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models" / "phi-2-int8-ov"
MODEL_DIR = str(MODEL_DIR.as_posix())  # POSIX-safe path for cross-platform

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, trust_remote_code=True)
model = OVModelForCausalLM.from_pretrained(MODEL_DIR, device_map="AUTO", trust_remote_code=True)

# Ensure pad token is defined
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

def generate_answer(prompt: str, max_tokens: int = 200) -> str:
    """
    Generate a text response using the loaded Phi-2 OpenVINO model.
    """
    inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True)

    output_ids = model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_new_tokens=max_tokens,
        pad_token_id=tokenizer.pad_token_id
    )

    answer = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return answer.split("Answer:")[-1].strip()

def answer_question(question: str, context: str = "") -> str:
    """
    Answer a given question using an optional context.
    """
    if context:
        prompt = f"Context: {context}\nQuestion: {question}\nAnswer:"
    else:
        prompt = f"Question: {question}\nAnswer:"

    return generate_answer(prompt)



# Optional: Simple test
if __name__ == "__main__":
    question = "What is machine learning?"
    context = "Machine learning is a branch of artificial intelligence that uses data to learn patterns."
    print("Answer:", answer_question(question, context))
