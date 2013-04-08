/*
 * The MIT License (MIT)
 * Copyright (c) 2013 Lance Campbell. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, regexp: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    "use strict";

    // --- Constants ---
    var SIZE_ANY        = 0,
        SIZE_SHORT      = 1,
        SIZE_MEDIUM     = 2,
        SIZE_LONG       = 3,
        SIZE_VERY_LONG  = 4;
    
    var DEFAULT_UNIT_TYPE   = "paragraph",
        DEFAULT_UNIT_COUNT  = 1,
        DEFAULT_UNIT_SIZE   = SIZE_MEDIUM,
        DEFAULT_IS_WRAPPED  = true,
        DEFAULT_WRAP_WIDTH  = 80,
        DEFAULT_IS_HTML     = false;

    // --- Private members
    var _shortWords     = [ // Words with less than four letters
        "a", "ab", "ad", "an", "aut", "de", "do", "e", "ea", "est",
        "et", "eu", "ex", "hic", "id", "iis", "in", "ita", "nam", "ne",
        "non", "o", "qui", "quo", "se", "sed", "si", "te", "ubi", "ut"
    ];
    
    var _mediumWords    = [ // Words with four to six letters
        "amet", "aliqua", "anim", "aute", "cillum", "culpa", "dolor",
        "dolore", "duis", "elit", "enim", "eram", "esse", "fore",
        "fugiat", "illum", "ipsum", "irure", "labore", "legam",
        "lorem", "magna", "malis", "minim", "multos", "nisi",
        "noster", "nulla", "quae", "quem", "quid", "quis", "quorum",
        "sint", "summis", "sunt", "tamen", "varias", "velit", "veniam"
    ];
    
    var _longWords      = [ // Words with seven to ten letters
        "admodum", "aliquip", "appellat", "arbitror", "cernantur",
        "commodo", "consequat", "cupidatat", "deserunt", "doctrina",
        "eiusmod", "excepteur", "expetendis", "fabulas", "incididunt",
        "incurreret", "ingeniis", "iudicem", "laboris", "laborum",
        "litteris", "mandaremus", "mentitum", "nescius", "nostrud",
        "occaecat", "officia", "offendit", "pariatur", "possumus",
        "probant", "proident", "quamquam", "quibusdam", "senserit",
        "singulis", "tempor", "ullamco", "vidisse", "voluptate"
    ];
    
    var _veryLongWords  = [ // Words with more than ten letters
        "adipisicing", "arbitrantur", "cohaerescant", "comprehenderit",
        "concursionibus", "coniunctione", "consectetur", "despicationes",
        "distinguantur", "domesticarum", "efflorescere", "eruditionem",
        "exquisitaque", "exercitation", "familiaritatem", "fidelissimae",
        "firmissimum", "graviterque", "illustriora", "instituendarum",
        "imitarentur", "philosophari", "praesentibus", "praetermissum",
        "relinqueret", "reprehenderit", "sempiternum", "tractavissent",
        "transferrem", "voluptatibus"
    ];
    
    var _allWords = _shortWords.concat(_mediumWords, _longWords, _veryLongWords);
    
    // Sentence fragment patterns, based off of randomly selected Latin phrases.
    // Used to build all sentences and paragraphs.
    var _fragmentPatterns = [
        // Three words
        [SIZE_SHORT, SIZE_MEDIUM, SIZE_LONG],
        [SIZE_SHORT, SIZE_MEDIUM, SIZE_VERY_LONG],
        [SIZE_SHORT, SIZE_SHORT, SIZE_VERY_LONG],
        [SIZE_SHORT, SIZE_LONG, SIZE_VERY_LONG],
        [SIZE_MEDIUM, SIZE_LONG, SIZE_LONG],
        [SIZE_MEDIUM, SIZE_LONG, SIZE_VERY_LONG],
        [SIZE_MEDIUM, SIZE_SHORT, SIZE_LONG],
        [SIZE_LONG, SIZE_SHORT, SIZE_MEDIUM],
        [SIZE_LONG, SIZE_SHORT, SIZE_LONG],
        [SIZE_LONG, SIZE_MEDIUM, SIZE_LONG],
        
        // Four words
        [SIZE_SHORT, SIZE_SHORT, SIZE_MEDIUM, SIZE_LONG],
        [SIZE_SHORT, SIZE_MEDIUM, SIZE_SHORT, SIZE_MEDIUM],
        [SIZE_SHORT, SIZE_MEDIUM, SIZE_LONG, SIZE_LONG],
        [SIZE_SHORT, SIZE_MEDIUM, SIZE_LONG, SIZE_VERY_LONG],
        [SIZE_SHORT, SIZE_LONG, SIZE_SHORT, SIZE_LONG],
        [SIZE_MEDIUM, SIZE_LONG, SIZE_SHORT, SIZE_LONG],
        [SIZE_MEDIUM, SIZE_LONG, SIZE_SHORT, SIZE_VERY_LONG],
        [SIZE_LONG, SIZE_SHORT, SIZE_MEDIUM, SIZE_LONG],
        [SIZE_LONG, SIZE_MEDIUM, SIZE_LONG, SIZE_LONG],
        [SIZE_LONG, SIZE_VERY_LONG, SIZE_SHORT, SIZE_LONG],
        
        // Five words
        [SIZE_SHORT, SIZE_SHORT, SIZE_MEDIUM, SIZE_MEDIUM, SIZE_MEDIUM],
        [SIZE_SHORT, SIZE_MEDIUM, SIZE_MEDIUM, SIZE_SHORT, SIZE_LONG],
        [SIZE_SHORT, SIZE_MEDIUM, SIZE_MEDIUM, SIZE_MEDIUM, SIZE_LONG],
        [SIZE_MEDIUM, SIZE_SHORT, SIZE_SHORT, SIZE_MEDIUM, SIZE_LONG],
        [SIZE_MEDIUM, SIZE_SHORT, SIZE_LONG, SIZE_SHORT, SIZE_MEDIUM],
        [SIZE_MEDIUM, SIZE_LONG, SIZE_SHORT, SIZE_MEDIUM, SIZE_MEDIUM],
        [SIZE_MEDIUM, SIZE_VERY_LONG, SIZE_LONG, SIZE_MEDIUM, SIZE_LONG],
        [SIZE_LONG, SIZE_MEDIUM, SIZE_SHORT, SIZE_LONG, SIZE_VERY_LONG],
        [SIZE_LONG, SIZE_MEDIUM, SIZE_MEDIUM, SIZE_SHORT, SIZE_MEDIUM],
        [SIZE_LONG, SIZE_MEDIUM, SIZE_MEDIUM, SIZE_LONG, SIZE_MEDIUM]
    ];
    
    // --- Helper functions
    function _getRandomWord(size) {
        var wordArray = [];
        
        switch (size) {
        case SIZE_ANY:
            wordArray = _allWords;
            break;
        case SIZE_SHORT:
            wordArray = _shortWords;
            break;
        case SIZE_MEDIUM:
            wordArray = _mediumWords;
            break;
        case SIZE_LONG:
            wordArray = _longWords;
            break;
        case SIZE_VERY_LONG:
            wordArray = _veryLongWords;
            break;
        default:
            wordArray = _allWords;
        }
        
        return wordArray[Math.floor(Math.random() * wordArray.length)];
    }
    
    function _getRandomWords(count) {
        var finalText   = "",
            i           = 0;
        
        for (i = 0; i < count; i++) {
            finalText += _getRandomWord(SIZE_ANY);
            finalText += " ";
        }
        
        return finalText.trim();
    }
    
    function _getRandomFragment() {
        var pattern     = [],
            i           = 0,
            finalText   = "";
            
        pattern = _fragmentPatterns[Math.floor(Math.random() * _fragmentPatterns.length)];
        
        for (i = 0; i < pattern.length; i++) {
            finalText += _getRandomWord(pattern[i]);
            finalText += " ";
        }
        
        return finalText.trim();
    }
    
    function _getRandomSentence(size) {
        var finalText   = "";
        
        switch (size) {
        case SIZE_SHORT:
            finalText += _getRandomFragment();
            break;
        case SIZE_MEDIUM:
            finalText = _getRandomSentence(SIZE_SHORT);
            if (Math.random() < 0.5) {
                finalText += ", ";
            } else {
                finalText += " ";
                finalText += _getRandomWord(SIZE_SHORT);
                finalText += " ";
            }
            finalText += _getRandomSentence(SIZE_SHORT);
            break;
        case SIZE_LONG:
            finalText = _getRandomSentence(SIZE_MEDIUM);
            if (Math.random() < 0.5) {
                finalText += ", ";
            } else {
                finalText += " ";
                finalText += _getRandomWord(SIZE_SHORT);
                finalText += " ";
            }
            finalText += _getRandomSentence(SIZE_MEDIUM);
            break;
        case SIZE_VERY_LONG:
            finalText = _getRandomSentence(SIZE_LONG);
            if (Math.random() < 0.5) {
                finalText += ", ";
            } else {
                finalText += " ";
                finalText += _getRandomWord(SIZE_SHORT);
                finalText += " ";
            }
            finalText += _getRandomSentence(SIZE_LONG);
            break;
        default:
            finalText += _getRandomSentence(SIZE_MEDIUM);
        }
        
        return finalText;
    }
    
    function _getRandomSentences(count, size, isHTML) {
        var i           = 0,
            sentence    = "",
            finalText   = "";
        
        for (i = 0; i < count; i++) {
            finalText   += (isHTML ? "<p>" : "");
            sentence    = _getRandomSentence(size);
            sentence    = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ". ";
            finalText   += sentence.trim();
            finalText   += (isHTML ? "</p>\n" : "\n\n");
        }

        return finalText.trim();
    }
    
    function _getRandomParagraph(size) {
        var finalText       = "",
            sentenceCount   = 0,
            i               = 0,
            sentence        = "";
        
        switch (size) {
        case SIZE_SHORT:
            sentenceCount = 3 + Math.floor(Math.random() * 2); // Three to five sentences
            for (i = 0; i < sentenceCount; i++) {
                sentence    = _getRandomSentence(SIZE_ANY);
                sentence    = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ". ";
                finalText   += sentence;
            }
            break;
        case SIZE_MEDIUM:
            finalText += _getRandomParagraph(SIZE_SHORT);
            finalText += _getRandomParagraph(SIZE_SHORT);
            break;
        case SIZE_LONG:
            finalText += _getRandomParagraph(SIZE_MEDIUM);
            finalText += _getRandomParagraph(SIZE_MEDIUM);
            break;
        case SIZE_VERY_LONG:
            finalText += _getRandomParagraph(SIZE_LONG);
            finalText += _getRandomParagraph(SIZE_LONG);
            break;
        default:
            finalText += _getRandomParagraph(SIZE_MEDIUM);
        }
        
        return finalText;
    }
    
    function _getRandomParagraphs(count, size, isHTML) {
        var i           = 0,
            paragraph   = "",
            finalText   = "";
        
        for (i = 0; i < count; i++) {
            finalText   += (isHTML ? "<p>" : "");
            paragraph   = _getRandomParagraph(size);
            finalText   += paragraph.trim();
            finalText   += (isHTML ? "</p>\n" : "\n\n");
        }

        return finalText.trim();
    }
    
    function _isNumber(value) {
        return (typeof value === "number") && (isFinite(value));
    }

    // From http://james.padolsey.com/javascript/wordwrap-for-javascript/
    function _wordwrap(str, width, brk, cut) {
        brk = brk || "\n";
        width = width || 75;
        cut = cut || false;
        
        if (!str) { return str; }
        
        var regex = ".{1," + width + "}(\\s|$)" + (cut ? "|.{" + width + "}|.+$" : "|\\S+?(\\s|$)");
        
        return str.match(new RegExp(regex, "g")).join(brk);
    }
    
    // Public methods
    function parseCommand(command) {
        var i,
            commandArray    = command.split("_"),
            commandRegExp   = /([a-z]+)(\d*)/,
            commandResult   = [],
            commandString   = "",
            commandInt      = 0,
            finalText       = "";
        
        // Command options
        var unitType    = DEFAULT_UNIT_TYPE,
            unitCount   = DEFAULT_UNIT_COUNT,
            unitSize    = DEFAULT_UNIT_SIZE,
            isWrapped   = DEFAULT_IS_WRAPPED,
            wrapWidth   = DEFAULT_WRAP_WIDTH,
            isHTML      = DEFAULT_IS_HTML;
            
        // Parse the command string
        for (i = 1; i < commandArray.length; i++) {
            commandResult   = commandArray[i].match(commandRegExp);
            commandString   = commandResult[1];
            commandInt      = parseInt(commandResult[2], 10);
            
            switch (commandString) {
            case "p":
                unitType = "paragraph";
                unitCount = (_isNumber(commandInt)) ? commandInt : DEFAULT_UNIT_COUNT;
                break;
            case "w":
                unitType = "word";
                unitCount = (_isNumber(commandInt)) ? commandInt : DEFAULT_UNIT_COUNT;
                break;
            case "s":
                unitType = "sentence";
                unitCount = (_isNumber(commandInt)) ? commandInt : DEFAULT_UNIT_COUNT;
                break;
            case "short":
                unitSize = SIZE_SHORT;
                break;
            case "medium":
                unitSize = SIZE_MEDIUM;
                break;
            case "long":
                unitSize = SIZE_LONG;
                break;
            case "vlong":
                unitSize = SIZE_VERY_LONG;
                break;
            case "nowrap":
                isWrapped = false;
                break;
            case "wrap":
                isWrapped = true;
                wrapWidth = (_isNumber(commandInt)) ? commandInt : DEFAULT_WRAP_WIDTH;
                break;
            case "html":
                isHTML = true;
                break;
            default:
                // Command Error: just return an empty string for now
                // TODO: return a useful error message that helps fix the command
                return "";
            }
        }
        
        switch (unitType) {
        case "paragraph":
            finalText = _getRandomParagraphs(unitCount, unitSize, isHTML);
            break;
        case "sentence":
            finalText = _getRandomSentences(unitCount, unitSize, isHTML);
            break;
        case "word":
            finalText = _getRandomWords(unitCount);
            break;
        default:
            finalText = _getRandomParagraphs(DEFAULT_UNIT_COUNT, DEFAULT_UNIT_SIZE);
        }
            
        if (isWrapped) {
            if (wrapWidth && (wrapWidth > 0)) {
                finalText = _wordwrap(finalText, wrapWidth);
            } else {
                finalText = _wordwrap(finalText, DEFAULT_WRAP_WIDTH);
            }
        }
        
        return finalText;
    }
    
    // --- Public API ---
    exports.parseCommand = parseCommand;
});