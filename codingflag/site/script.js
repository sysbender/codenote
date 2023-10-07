const htmlEditorElem = document.querySelector(".editor .code .html-code");
const cssEditorElem = document.querySelector(".editor .code .css-code");
const jsEditorElem = document.querySelector(".editor .code .js-code");
const runBtnElem = document.querySelector("#run-btn");
const previewWindowElem = document.querySelector("#preview-window");

const htmlEditor = CodeMirror(htmlEditorElem, {
  lineNumber: true,
  tabSize: 4,
  mode: "xml",
});

const cssEditor = CodeMirror(cssEditorElem, {
  lineNumber: true,
  tabSize: 4,
  mode: "css",
});

const jsEditor = CodeMirror(jsEditorElem, {
  lineNumber: true,
  tabSize: 4,
  mode: "javascript",
});

runBtnElem.addEventListener("click", function () {
  let htmlCode = htmlEditor.getValue();
  let cssCode = "<style>" + cssEditor.getValue() + "</style>";
  let jsCode = "<scri" + "pt>" + jsEditor.getValue() + "</scri" + "pt>";

  let previewWindow = previewWindowElem.contentWindow.document;
  previewWindow.open();
  previewWindow.write(htmlCode + cssCode + jsCode);
  previewWindow.close();
});
