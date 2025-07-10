# Script to download required models for the AI Classroom Assistant
# Downloads: Phi-2 (OpenVINO), BLIP (PyTorch)
# Usage: python download_modals.py

import os
from pathlib import Path
from huggingface_hub import snapshot_download, login

MODELS = [
    {
        'name': 'Phi-2 (OpenVINO)',
        'repo_id': 'OpenVINO/phi-2-int8-ov',
        'local_dir': 'phi-2-int8-ov',
    },
    {
        'name': 'BLIP (PyTorch)',
        'repo_id': 'Salesforce/blip-image-captioning-base',
        'local_dir': 'blip_pytorch',
    },
    
]


def download_model(repo_id, local_dir):
    # Download into the current directory (where this script is run)
    local_dir_path = Path(os.getcwd()) / local_dir
    print(f"Downloading {repo_id} to {local_dir_path} ...")
    local_dir_path.mkdir(parents=True, exist_ok=True)
    snapshot_download(repo_id=repo_id, local_dir=str(local_dir_path), local_dir_use_symlinks=False)
    print(f"Downloaded {repo_id} to {local_dir_path}")



def login_huggingface():
    token = os.environ.get('HF_TOKEN')
    if not token:
        token = input("Enter your Hugging Face token (leave blank to skip login): ").strip()
    if token:
        login(token=token)
        print("Logged in to Hugging Face Hub.")
    else:
        print("Proceeding without Hugging Face login. If a model is gated, download may fail.")
    return token


def main():
    print("Select an option:")
    print("1. Login to Hugging Face Hub")
    print("2. Download models")
    print("3. Login and Download models")
    choice = input("Enter 1, 2, or 3: ").strip()
    if choice == '1':
        login_huggingface()
    elif choice == '2':
        for model in MODELS:
            print(f"\n=== {model['name']} ===")
            download_model(model['repo_id'], model['local_dir'])
        print("\nAll models downloaded.")
    elif choice == '3':
        login_huggingface()
        for model in MODELS:
            print(f"\n=== {model['name']} ===")
            download_model(model['repo_id'], model['local_dir'])
        print("\nAll models downloaded.")
    else:
        print("Invalid option. Exiting.")

if __name__ == "__main__":
    main()
