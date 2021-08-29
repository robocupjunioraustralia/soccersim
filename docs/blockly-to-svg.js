// Source: https://github.com/Program-AR/blockly-to-svg
// MIT License

// Copyright (c) 2019 Team Uroboros

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var DOMURL = self.URL || self.webkitURL || self;

var customCSS = '.blocklyText {cursor: default;fill: #fff;font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;font-size: 12pt;font-weight: 600;}.blocklyNonEditableText>rect:not(.blocklyDropdownRect),.blocklyEditableText>rect:not(.blocklyDropdownRect) {fill: #fff;}.blocklyNonEditableText>text,.blocklyEditableText>text,.blocklyNonEditableText>g>text,.blocklyEditableText>g>text {fill: #575E75;}.blocklyDraggable:not(.blocklyDisabled) .blocklyEditableText:not(.editing):hover>rect ,.blocklyDraggable:not(.blocklyDisabled) .blocklyEditableText:not(.editing):hover>.blocklyPath {stroke: #fff;stroke-width: 2;}.blocklyHtmlInput {font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;font-weight: 600;color: #575E75;}.blocklyDropdownText {fill: #fff !important;}.blocklyWidgetDiv .goog-menuitem,.blocklyDropDownDiv .goog-menuitem {font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;}.blocklyDropDownDiv .goog-menuitem-content {color: #fff;}.blocklyHighlightedConnectionPath {stroke: #fff200;}.blocklyDisabled > .blocklyOutlinePath {fill: url(#blocklyDisabledPattern5393562234375695)}.blocklyConnectionIndicator, .blocklyInputConnectionIndicator {fill: #ff0000;fill-opacity: 0.9;stroke: #ffff00;stroke-width: 3px;}.blocklyConnectionIndicator {display: none;}.blocklyBlockDragSurface > g > .blocklyDraggable > .blocklyConnectionIndicator {display: block;}.blocklyConnectionLine {stroke: #ffff00;stroke-width: 4px;}.blocklyConnectionLine.hidden {display: none;}';

function svg(){
    canvas = Blockly.mainWorkspace.svgBlockCanvas_.cloneNode(true);
    if (canvas.children[0] === undefined) throw "Couldn't find Blockly canvas."

    canvas.removeAttribute("transform");

    var css = '<defs><style type="text/css" xmlns="http://www.w3.org/1999/xhtml"><![CDATA[' + Blockly.Css.CONTENT.join('') + customCSS + ']]></style></defs>';
    var bbox = document.getElementsByClassName("blocklyBlockCanvas")[0].getBBox();
    var content = new XMLSerializer().serializeToString(canvas);

    xml = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'
        + bbox.width + '" height="' + bbox.height + '" viewBox=" ' + bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height + '">' +
        css + '">' + content + '</svg>';    

    return new Blob([xml], { type: 'image/svg+xml;base64' });
}

function download(url, filename){
        let element = document.createElement('a')
        element.href = url
        element.download = filename;
        element.click();
        DOMURL.revokeObjectURL(element.href)
}

function exportSVG() {
    download(DOMURL.createObjectURL(svg()),'blocks.svg');
}

function exportPNG(){
    var img = new Image();
    img.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.getContext("2d").drawImage(img, 0, 0);
        download(canvas.toDataURL("image/png"),'blocks.png');
    };
    img.src = DOMURL.createObjectURL(svg());
}

exportSVG()