# Set the path
import os, sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from imagineer import app


if __name__ == "__main__":
    app.run('0.0.0.0')
