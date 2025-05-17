#!/bin/bash
# Setup script for the backend development environment using uv

# Navigate to the backend directory
cd "."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 before continuing."
    exit 1
fi

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Install uv if not already installed
if ! command -v uv &> /dev/null; then
    echo "Installing uv..."
    pip install uv
fi

# Install dependencies using uv
echo "Installing dependencies using uv..."
uv pip install -r requirements.txt

echo "Backend development environment setup complete!"
echo "To activate the environment, run: source venv/bin/activate"
echo "To start the development server, run: python app.py"

