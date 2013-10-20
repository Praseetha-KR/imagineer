import sys
import os.path
sys.path.insert(0, os.path.dirname(__file__))


from imagineer import app as application
if __name__ == "__main__":
	application.run(debug=application.config['DEBUG'], port=application.config['PORT'])