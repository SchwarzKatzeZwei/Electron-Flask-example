from flask import Flask

app = Flask(__name__)


@app.route("/")
def index():
    return """
    <h1><font color="red">PythonとElectronを使ったアプリ</font></h1>
    <h2><font color="blue">表示結果</font></h2>
    <p>この文章は、</p>
    <p>Electronでindex.jsを読み込んだあと、</p>
    <p><pre>「require('child_process').spawn('python',['./index.py']);」</pre></p>
    <p>によって、index.pyファイルを読み込み表示した文章です。</p>
    """


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
