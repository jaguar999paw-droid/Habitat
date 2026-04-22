#!/usr/bin/env python3
"""
ML Service Setup — Pre-cache models and validate dependencies
Run once during initial setup to download transformers model.
Subsequent startups skip this if model is cached.
"""
import os
import sys
from pathlib import Path

def setup_models():
    """Download and cache the sentence-transformers model."""
    print("🔧 ML Service Setup — Pre-caching models...")
    print()
    
    try:
        from sentence_transformers import SentenceTransformer
        
        model_name = 'paraphrase-MiniLM-L6-v2'
        cache_dir = Path.home() / '.cache' / 'huggingface' / 'hub'
        
        print(f"  Downloading {model_name}...")
        print(f"  Cache location: {cache_dir}")
        print()
        
        # This will download the model to the huggingface cache
        model = SentenceTransformer(model_name)
        
        print()
        print(f"✓ Model '{model_name}' cached successfully")
        print(f"  Model size: ~80MB")
        print(f"  Cache location: {cache_dir}")
        print()
        return True
        
    except ImportError as e:
        print(f"✗ Error: Missing dependencies")
        print(f"  {e}")
        print()
        print("  Run: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"✗ Error downloading model: {e}")
        return False

if __name__ == '__main__':
    success = setup_models()
    sys.exit(0 if success else 1)
