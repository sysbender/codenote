/// <reference path="../../monaco-editor-0.18.1/monaco.d.ts" />

(function () {
  "use strict";

  window.onload = function () {
    // This code runs when the webpage has fully loaded
    // Load the 'editor.main' module from the Monaco Editor library
    require(["vs/editor/editor.main"], function () {
      /*
		// Load and add an external TypeScript definition file ('monaco.d.ts.txt') as an extra library

      xhr("../lib/monaco-editor-website/playground/monaco.d.ts.txt").then(
        function (response) {
          // Add the content of the loaded file as an extra library with the name 'monaco.d.ts'
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            response.responseText,
            "monaco.d.ts"
          );

          // Add a custom TypeScript definition for 'require' as an extra library ('require.d.ts')
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            [
              "declare var require: {",
              "	toUrl(path: string): string;",
              "	(moduleName: string): any;",
              "	(dependencies: string[], callback: (...args: any[]) => any, errorback?: (err: any) => void): any;",
              "	config(data: any): any;",
              "	onError: Function;",
              "};",
            ].join("\n"),
            "require.d.ts"
          );
        }
      );
	  */
      // Remove the 'loading' element from the DOM
      var loading = document.getElementById("loading");
      loading.parentNode.removeChild(loading);
      // Call the 'load' function
      load();
    });
  };

  var editor = null;
  var data = {
    js: {
      model: null,
      state: null,
    },
    css: {
      model: null,
      state: null,
    },
    html: {
      model: null,
      state: null,
    },
  };

  function load() {
    function layout() {
      var GLOBAL_PADDING = 20;

      var WIDTH = window.innerWidth - 2 * GLOBAL_PADDING;
      var HEIGHT = window.innerHeight;

      var TITLE_HEIGHT = 110;
      var FOOTER_HEIGHT = 80;
      var TABS_HEIGHT = 20;
      var INNER_PADDING = 20;
      var SWITCHER_HEIGHT = 30;

      var HALF_WIDTH = Math.floor((WIDTH - INNER_PADDING) / 2);
      var REMAINING_HEIGHT =
        HEIGHT - TITLE_HEIGHT - FOOTER_HEIGHT - SWITCHER_HEIGHT;

      playgroundContainer.style.width = WIDTH + "px";
      playgroundContainer.style.height = HEIGHT - FOOTER_HEIGHT + "px";

      sampleSwitcher.style.position = "absolute";
      sampleSwitcher.style.top = TITLE_HEIGHT + "px";
      sampleSwitcher.style.left = GLOBAL_PADDING + "px";

      typingContainer.style.position = "absolute";
      typingContainer.style.top =
        GLOBAL_PADDING + TITLE_HEIGHT + SWITCHER_HEIGHT + "px";
      typingContainer.style.left = GLOBAL_PADDING + "px";
      typingContainer.style.width = HALF_WIDTH + "px";
      typingContainer.style.height = REMAINING_HEIGHT + "px";

      tabArea.style.position = "absolute";
      tabArea.style.boxSizing = "border-box";
      tabArea.style.top = 0;
      tabArea.style.left = 0;
      tabArea.style.width = HALF_WIDTH + "px";
      tabArea.style.height = TABS_HEIGHT + "px";

      editorContainer.style.position = "absolute";
      editorContainer.style.boxSizing = "border-box";
      editorContainer.style.top = TABS_HEIGHT + "px";
      editorContainer.style.left = 0;
      editorContainer.style.width = HALF_WIDTH + "px";
      editorContainer.style.height = REMAINING_HEIGHT - TABS_HEIGHT + "px";

      if (editor) {
        editor.layout({
          width: HALF_WIDTH - 2,
          height: REMAINING_HEIGHT - TABS_HEIGHT - 1,
        });
      }

      runContainer.style.position = "absolute";
      runContainer.style.top =
        GLOBAL_PADDING + TITLE_HEIGHT + SWITCHER_HEIGHT + TABS_HEIGHT + "px";
      runContainer.style.left =
        GLOBAL_PADDING + INNER_PADDING + HALF_WIDTH + "px";
      runContainer.style.width = HALF_WIDTH + "px";
      runContainer.style.height = REMAINING_HEIGHT - TABS_HEIGHT + "px";

      runIframeHeight = REMAINING_HEIGHT - TABS_HEIGHT;
      if (runIframe) {
        runIframe.style.height = runIframeHeight + "px";
      }
    }

    function changeTab(selectedTabNode, desiredModelId) {
      for (var i = 0; i < tabArea.childNodes.length; i++) {
        var child = tabArea.childNodes[i];
        if (/tab/.test(child.className)) {
          child.className = "tab";
        }
      }
      selectedTabNode.className = "tab active";

      var currentState = editor.saveViewState();

      var currentModel = editor.getModel();
      if (currentModel === data.js.model) {
        data.js.state = currentState;
      } else if (currentModel === data.css.model) {
        data.css.state = currentState;
      } else if (currentModel === data.html.model) {
        data.html.state = currentState;
      }

      editor.setModel(data[desiredModelId].model);
      editor.restoreViewState(data[desiredModelId].state);
      editor.focus();
    }

    // create the typing side
    var typingContainer = document.createElement("div");
    typingContainer.className = "typingContainer";

    var tabArea = (function () {
      var tabArea = document.createElement("div");
      tabArea.className = "tabArea";

      var jsTab = document.createElement("span");
      jsTab.className = "tab active";
      jsTab.appendChild(document.createTextNode("JavaScript"));
      jsTab.onclick = function () {
        changeTab(jsTab, "js");
      };
      tabArea.appendChild(jsTab);

      var cssTab = document.createElement("span");
      cssTab.className = "tab";
      cssTab.appendChild(document.createTextNode("CSS"));
      cssTab.onclick = function () {
        changeTab(cssTab, "css");
      };
      tabArea.appendChild(cssTab);

      var htmlTab = document.createElement("span");
      htmlTab.className = "tab";
      htmlTab.appendChild(document.createTextNode("HTML"));
      htmlTab.onclick = function () {
        changeTab(htmlTab, "html");
      };
      tabArea.appendChild(htmlTab);

      var runBtn = document.createElement("span");
      runBtn.className = "action run";
      runBtn.appendChild(document.createTextNode("Run"));
      runBtn.onclick = function () {
        run();
      };
      tabArea.appendChild(runBtn);

      return tabArea;
    })();

    var editorContainer = document.createElement("div");
    editorContainer.className = "editor-container";

    typingContainer.appendChild(tabArea);
    typingContainer.appendChild(editorContainer);

    var runContainer = document.createElement("div");
    runContainer.className = "run-container";

    var sampleSwitcher = document.createElement("select");
    var sampleChapter;
    PLAY_SAMPLES.forEach(function (sample) {
      if (!sampleChapter || sampleChapter.label !== sample.chapter) {
        sampleChapter = document.createElement("optgroup");
        sampleChapter.label = sample.chapter;
        sampleSwitcher.appendChild(sampleChapter);
      }
      var sampleOption = document.createElement("option");
      sampleOption.value = sample.id;
      sampleOption.appendChild(document.createTextNode(sample.name));
      sampleChapter.appendChild(sampleOption);
    });
    sampleSwitcher.className = "sample-switcher";

    var LOADED_SAMPLES = [];
    function findLoadedSample(sampleId) {
      for (var i = 0; i < LOADED_SAMPLES.length; i++) {
        var sample = LOADED_SAMPLES[i];
        if (sample.id === sampleId) {
          return sample;
        }
      }
      return null;
    }

    function findSamplePath(sampleId) {
      for (var i = 0; i < PLAY_SAMPLES.length; i++) {
        var sample = PLAY_SAMPLES[i];
        if (sample.id === sampleId) {
          return sample.path;
        }
      }
      return null;
    }

    function loadSample(sampleId, callback) {
      var sample = findLoadedSample(sampleId);
      if (sample) {
        return callback(null, sample);
      }

      var samplePath = findSamplePath(sampleId);
      if (!samplePath) {
        return callback(new Error("sample not found"));
      }

      samplePath =
        "../lib/monaco-editor-website/" +
        "playground/new-samples/" +
        samplePath;

      var js = xhr(samplePath + "/sample.js").then(function (response) {
        return response.responseText;
      });
      var css = xhr(samplePath + "/sample.css").then(function (response) {
        return response.responseText;
      });
      var html = xhr(samplePath + "/sample.html").then(function (response) {
        return response.responseText;
      });
      Promise.all([js, css, html]).then(
        function (_) {
          var js = _[0];
          var css = _[1];
          var html = _[2];
          LOADED_SAMPLES.push({
            id: sampleId,
            js: js,
            css: css,
            html: html,
          });
          return callback(null, findLoadedSample(sampleId));
        },
        function (err) {
          callback(err, null);
        }
      );
    }

    sampleSwitcher.onchange = function () {
      var sampleId = sampleSwitcher.options[sampleSwitcher.selectedIndex].value;
      window.location.hash = sampleId;
    };

    var playgroundContainer = document.getElementById("playground");

    layout();
    window.onresize = layout;

    playgroundContainer.appendChild(sampleSwitcher);
    playgroundContainer.appendChild(typingContainer);
    playgroundContainer.appendChild(runContainer);

    data.js.model = monaco.editor.createModel(
      'console.log("hi")',
      "javascript"
    );
    data.css.model = monaco.editor.createModel("css", "css");
    data.html.model = monaco.editor.createModel("html", "html");

    editor = monaco.editor.create(editorContainer, {
      model: data.js.model,
      minimap: {
        enabled: false,
      },
    });

    var currentToken = 0;
    function parseHash(firstTime) {
      var sampleId = window.location.hash.replace(/^#/, "");
      if (!sampleId) {
        sampleId = PLAY_SAMPLES[0].id;
      }

      if (firstTime) {
        for (var i = 0; i < sampleSwitcher.options.length; i++) {
          var opt = sampleSwitcher.options[i];
          if (opt.value === sampleId) {
            sampleSwitcher.selectedIndex = i;
            break;
          }
        }
      }

      var myToken = ++currentToken;
      loadSample(sampleId, function (err, sample) {
        if (err) {
          alert("Sample not found! " + err.message);
          return;
        }
        if (myToken !== currentToken) {
          return;
        }
        data.js.model.setValue(sample.js);
        data.html.model.setValue(sample.html);
        data.css.model.setValue(sample.css);
        editor.setScrollTop(0);
        run();
      });
    }
    window.onhashchange = parseHash;
    parseHash(true);

    function run() {
      doRun(runContainer);
    }
  }

  var runIframe = null,
    runIframeHeight = 0;
  function doRun(runContainer) {
    if (runIframe) {
      // Unload old iframe
      runContainer.removeChild(runIframe);
    }

    // Load new iframe
    runIframe = document.createElement("iframe");
    runIframe.id = "runner";
    runIframe.src =
      "../lib/monaco-editor-website/" + "playground/playground-runner.html";
    runIframe.className = "run-iframe";
    runIframe.style.boxSizing = "border-box";
    runIframe.style.height = runIframeHeight + "px";
    runIframe.style.width = "100%";
    runIframe.style.border = "1px solid lightgrey";
    runIframe.frameborder = "0";
    runContainer.appendChild(runIframe);

    var getLang = function (lang) {
      return data[lang].model.getValue();
    };

    runIframe.addEventListener("load", function (e) {
      runIframe.contentWindow.load(
        getLang("js"),
        getLang("html"),
        getLang("css")
      );
    });
  }

  /**
   *  preloading content from <pre> elements with a data-preload attribute
   * in an HTML document and storing that content in an object called preloaded.
   */
  var preloaded = {};
  (function () {
    // Select all <pre> elements with a 'data-preload' attribute.
    var elements = Array.prototype.slice.call(
      //It converts the resulting NodeList into an array using Array.prototype.slice.call().
      // can use Array.from or spread operator ...
      document.querySelectorAll("pre[data-preload]"),
      0
    );

    // Iterate through each selected <pre> element.
    elements.forEach(function (el) {
      // Get the 'data-preload' attribute value, which likely contains a path or identifier.
      var path = el.getAttribute("data-preload");
      // Get the text content of the <pre> element (innerText for modern browsers, textContent for older browsers).
      // Then, store it in the 'preloaded' object using the 'path' as the key.
      preloaded[path] = el.innerText || el.textContent;
      // Remove the <pre> element from the DOM, as its content has been preloaded.
      el.parentNode.removeChild(el);
    });
  })(); // This is an immediately-invoked function expression (IIFE) that runs immediately.

  /**
   * This xhr function provides a convenient way to make asynchronous HTTP requests
   * and handle their responses using Promises,
   * making it useful for loading resources like text files in a web application.
   * @param {*} url
   * @returns
   */

  function xhr(url) {
    // Check if the resource with the specified URL is preloaded.
    if (preloaded[url]) {
      // If preloaded, resolve the Promise immediately with the preloaded content.
      return Promise.resolve({
        responseText: preloaded[url],
      });
    }

    var req = null; // Initialize an XMLHttpRequest object.
    // Create and return a new Promise.
    return new Promise(
      function (c, e) {
        //c=resolve, e=reject
        // Inside the Promise constructor:
        // Create a new XMLHttpRequest object.
        req = new XMLHttpRequest();
        // Set up an event handler to monitor the state change of the XMLHttpRequest.
        req.onreadystatechange = function () {
          if (req._canceled) {
            return; // If the request is canceled, do nothing.
          }

          if (req.readyState === 4) {
            // When the request reaches the 'DONE' state (readyState 4):
            if (
              (req.status >= 200 && req.status < 300) || // If the status code is in the 200-299 range, or
              req.status === 1223 // A workaround for Internet Explorer
            ) {
              c(req); // Resolve the Promise with the XMLHttpRequest object.
            } else {
              e(req); // Reject the Promise with the XMLHttpRequest object in case of an error.
            }
            // Remove the event listener to prevent memory leaks.
            req.onreadystatechange = function () {};
          }
        };
        // Configure the XMLHttpRequest object for a GET request to the specified URL.
        req.open("GET", url, true);
        req.responseType = "";
        // Send the GET request.
        req.send(null);
      },
      // This function is called when the Promise is canceled.
      function () {
        req._canceled = true;
        req.abort(); // Abort the XMLHttpRequest.
      }
    );
  }
})();
