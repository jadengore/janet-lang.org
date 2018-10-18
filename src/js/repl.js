var printRaw = (function () {
  var element = document.getElementById('replterm');
  if (element) element.textContent = ''; // clear browser cache
  return function (text) {
    if (element) {
      element.innerHTML += text;
      element.scrollTop = element.scrollHeight; // focus on bottom
    }
  }
})();

function htmlEscape(text) {
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  text = text.replace('\n', '<br>', 'g');
  text = text.replace(/\s/g, "&nbsp;");
  return text;
}

function cleanContentEditableInput(text) {
  text = text.replace(/\u00A0/g, " ");
  return text;
}

function print(text) {
  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
  printRaw(htmlEscape(text));
}

// Don't print initial errors
var errorsReady = false;

// Line history
var replHistory = [''];
var historyIndex = 0;

var Module = {
  preRun: [],
  print: function(x) {
    print(x + '\n');
  },
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (errorsReady) {
      printRaw('<span style="color:#E55;">' + htmlEscape(text + '\n') + '</span>')
    } else {
      console.error(text);
    }
  },
  postRun: [function() {
    Module._repl_init()
    var repl_input = Module.cwrap('repl_input', 'void', ['string']);
    var repl_prompt = Module.cwrap('repl_prompt', 'string', []);
    var promptel = document.getElementById('replprompt');
    promptel.textContent = repl_prompt();
    document.getElementById('replin').addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        const content = e.srcElement.textContent;
        const text = cleanContentEditableInput(content + '\n');
        replHistory.pop();
        replHistory.push(content);
        historyIndex = replHistory.length;
        replHistory.push('');
        e.srcElement.textContent = '';
        printRaw('<span style="color:#9198e5;">' + htmlEscape(repl_prompt() + text) + '</span>')
        repl_input(text);
        promptel.textContent = repl_prompt();
      } else if (e.keyCode === 38) {
        if (historyIndex > 0) {
          if (historyIndex === replHistory.length - 1) {
            replHistory.pop()
            replHistory.push(e.srcElement.textContent)
          }
          historyIndex--;
          e.srcElement.textContent = replHistory[historyIndex];
        }
      } else if (e.keyCode === 40) {
        if (historyIndex < replHistory.length - 1) {
          if (historyIndex === replHistory.length - 1) {
            replHistory.pop()
            replHistory.push(e.srcElement.textContent)
          }
          historyIndex++;
          e.srcElement.textContent = replHistory[historyIndex];
        }
      }
    });
    errorsReady = true;
  }]
};

