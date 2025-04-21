from flask import Flask, send_from_directory
import os
print(os.listdir('static'))

app = Flask(__name__)

@app.route('/')
def autoplay():
    return send_from_directory('static', 'autoplay.html')

if __name__ == '__main__':
    app.run(debug=True)
