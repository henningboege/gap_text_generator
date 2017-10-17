class Config {
      constructor(initialCharacterFilterList, linesPerPage, maxWordLen, uppercase) {
        this.__initialCharacterFilterList =initialCharacterFilterList;
        this.__linesPerPage = linesPerPage;
        this.__maxWordLen = maxWordLen;
        this.__uppercase = uppercase;
      }

      getInitialCharacterFilterList() {
          return this.__initialCharacterFilterList;
      }

      getLinesPerPage() {
          return this.__linesPerPage;
      }

      getMaxWordLen() {
            return this.__maxWordLen;
      }

      getUppercase() {
        return this.__uppercase;
    }
}

var templateList = null;

function onGenerate() {
    var initialCharacterFilter = document.getElementById("initial_character_filter").value.trim();
    var linesPerPage = document.getElementById("lines_per_page").value;
    var maxWordLen = document.getElementById("max_word_len").value;
    var initialCharacterFilterList = initialCharacterFilter.length > 0 ? initialCharacterFilter.split(/\s+/)  : []
    var uppercase = document.getElementById("uppercase").checked
    var config = new Config(initialCharacterFilterList, linesPerPage, maxWordLen, uppercase);
    if (config.getInitialCharacterFilterList().length == 0) {
        alert("Keine Buchstaben-Filter!!!");
        return;
    }
    if (templateList === null) {
        alert("Keine Vorlagen!!!");
        return;
    }

    newWindow(config);
}

function onTemplatesLoaded() {
    var textFile = document.getElementById('templates').contentDocument;
    var textObject = textFile.getElementsByTagName('pre')[0];
    var text = textObject.innerHTML;
    var allLines = text.split("\n");
    var templateListNew = [];
    allLines.forEach(function(line) {
        line = line.trim();
        if (line.length == 0) return;
        if (line[0] == "#") return;
        templateListNew.push(line);
    })
    templateList = templateListNew;
}

function shuffle(value) {
    if (value.length < 2) {
        return value.slice(0);
    }  else if (Array.isArray(value)) {
        var result = value.slice(0);
        numSwaps = result.length % 2 == 0 ? result.length - 1 : result.length
        for (iFirst = 0; iFirst <numSwaps; ++iFirst) {
            var iSecond = (iFirst + 1 + Math.floor(Math.random() * (result.length - 1))) % result.length; 
            var tmp = result[iFirst];
            result[iFirst] =  result[iSecond];
            result[iSecond] = tmp;
        }
        return result;
    } else if (typeof value === typeof "") {
        var characterList = value.split("");
        characterList = shuffle(characterList);
        return characterList.join("");
    }
}

function filterAndConvertTemplate(config, initialCharacterFilter, line) {
    var lineTerminator = line.slice(-1);
    if (lineTerminator == ".") {
        line = line.slice(0, -1);
    } else {
        lineTerminator = "";
    }
    var wordList = line.split(/\s+/) ;
    var wordListNew = [];
    var wordListRandom = [];
    var skip = true;
    for ( i = 0; i  < wordList.length; ++i) {
        var word = wordList[i];
        if (word[0] == "@") {
            word = word.substr(1);
            wordUpperCase = word.toUpperCase();
            firstCharUpper = wordUpperCase.charAt(0);
            if (word.length > config.getMaxWordLen()) continue;
            if ("*" === initialCharacterFilter ||  initialCharacterFilter.indexOf(firstCharUpper) >= 0) skip = false;
            wordListNew.push(new Array(word.length + 1).join(" __ "));
            characterList = word.split("");
            if (config.getUppercase()) {
                for ( i = 0; i  < characterList.length; ++i) {
                    characterList[i] = characterList[i].toUpperCase();
                }
            }
            characterList[0] = "<u>" + characterList[0] + "</u>";
            characterList = shuffle(characterList);
            wordRandom = characterList.join(" ");
            wordListRandom.push(" [ <b>" + wordRandom + "</b> ]");
        } else {
            wordListNew.push(word);
        }
    }
    
    return skip ? null : wordListNew.join(" ") + lineTerminator + wordListRandom.join(" ");
}

function filterTemplates(config, initialCharacterFilter) {
    var result = [];
    templateList.forEach(function(line) {
        var lineNew = filterAndConvertTemplate(config, initialCharacterFilter, line);
        if (lineNew) result.push(lineNew);
    });

    result = shuffle(result);
    result = result.slice(0, config.getLinesPerPage());
    return result;
}

function newWindow(config) {
    var win = window.open("");
    win.document.write("<!DOCTYPE html>\n" +
                                     "<html lang=\"de\">\n" +
                                     "<head>\n" +
                                     "<meta charset=\"utf-8\">\n" +
                                     "<style>\n" +
                                     "   @media print {\n" +
                                     "    div {page-break-after:always;}\n" +
                                     "   }\n" +
                                     "</style>\n" +
                                     "</head>" +
                                     "<body>\n")
    config.getInitialCharacterFilterList().forEach(function(initialCharacterFilter) {
        if (initialCharacterFilter ===  "*") {
            exerciseTitle = "Zufällige Buchstaben";
        } else if (initialCharacterFilter.length > 1) {
            exerciseTitle = "Buchstaben " + initialCharacterFilter;
        } else {
            exerciseTitle = "Buchstabe " + initialCharacterFilter;
        }
        win.document.write("<div><h3>" + exerciseTitle + ":</h3>");
        var lines = filterTemplates(config, initialCharacterFilter);
        for (var i  = 0; i < lines.length; ++i) {
            win.document.write("<p>");
            win.document.write(lines[i]);
            win.document.write("</p>\n");
        }
        win.document.write("</div>\n");
    })
    win.document.write("</body>\n" + 
                                     "</html>\n");
    win.stop()
    win.focus(); 
}

window.onload = function () {
    document.getElementById("onGenerate").onclick = onGenerate;
};
