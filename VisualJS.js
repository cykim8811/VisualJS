"use strict";
// Type Definition
class Pos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    added(pos) {
        return new Pos(this.x + pos.x, this.y + pos.y);
    }
}
class Size {
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }
}
class Rect {
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
    }
    get x() { return this.pos.x; }
    get y() { return this.pos.y; }
    get w() { return this.size.w; }
    get h() { return this.size.h; }
    get center() { return this.pos.added(new Pos(this.size.w * 0.5, this.size.h * 0.5)); }
    setSize(size) { this.size = size; return this; }
    setPos(pos) { this.pos = pos; return this; }
}
// VisualJS
class VisualJSPainter {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }
    drawRect(rect, col = "#CCC") {
        this.ctx.fillStyle = col;
        this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    strokeRect(rect, col = "#CCC", width = 1) {
        this.ctx.strokeStyle = col;
        this.ctx.lineWidth = width;
        this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    drawRoundRect(rect, col = "#CCC", r = 3) {
        if (rect.w <= r * 2 || rect.h <= r * 2) {
            this.drawRect(rect, col);
            return;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(rect.x + r, rect.y);
        this.ctx.lineTo(rect.x + rect.w - r, rect.y);
        this.ctx.quadraticCurveTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + r);
        this.ctx.lineTo(rect.x + rect.w, rect.y + rect.h - r);
        this.ctx.quadraticCurveTo(rect.x + rect.w, rect.y + rect.h, rect.x + rect.w - r, rect.y + rect.h);
        this.ctx.lineTo(rect.x + r, rect.y + rect.h);
        this.ctx.quadraticCurveTo(rect.x, rect.y + rect.h, rect.x, rect.y + rect.h - r);
        this.ctx.lineTo(rect.x, rect.y + r);
        this.ctx.quadraticCurveTo(rect.x, rect.y, rect.x + r, rect.y);
        this.ctx.fillStyle = col;
        this.ctx.fill();
    }
    strokeRoundRect(rect, col = "#CCC", width = 1, r = 3) {
        if (rect.w <= r * 2 || rect.h <= r * 2) {
            this.strokeRect(rect, col);
            return;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(rect.x + r, rect.y);
        this.ctx.lineTo(rect.x + rect.w - r, rect.y);
        this.ctx.quadraticCurveTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + r);
        this.ctx.lineTo(rect.x + rect.w, rect.y + rect.h - r);
        this.ctx.quadraticCurveTo(rect.x + rect.w, rect.y + rect.h, rect.x + rect.w - r, rect.y + rect.h);
        this.ctx.lineTo(rect.x + r, rect.y + rect.h);
        this.ctx.quadraticCurveTo(rect.x, rect.y + rect.h, rect.x, rect.y + rect.h - r);
        this.ctx.lineTo(rect.x, rect.y + r);
        this.ctx.quadraticCurveTo(rect.x, rect.y, rect.x + r, rect.y);
        this.ctx.strokeStyle = col;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }
    drawText(text, at, col = "#333", font = "") {
        this.ctx.fillStyle = col;
        this.ctx.font = font;
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, at.x + at.w / 2, at.y + at.h / 2);
    }
}
class Typedef {
    constructor(typename, typeclass) {
        this.typename = typename;
        this.typeclass = typeclass;
    }
}
class TypeList {
    constructor() {
        this.list = [];
    }
    getClass(data) {
        if (data == null)
            return NullNode;
        if (data == undefined)
            return UndefinedNode;
        let typename = data.constructor.name;
        for (let td of this.list) {
            if (td.typename == typename) {
                return td.typeclass;
            }
        }
        return ObjectNode;
    }
    add(typename, typeclass) {
        this.list.push(new Typedef(typename, typeclass));
    }
}
class VisualJSWorkspace {
    constructor(canvas) {
        this.painter = new VisualJSPainter(canvas);
        this.typelist = new TypeList();
        this.root = new FrameNode("root", new Size(this.painter.canvas.width, this.painter.canvas.height));
        this.pos = new Pos(0, 0);
    }
    addType(typename, typeclass) {
        this.typelist.add(typename, typeclass);
    }
    add(id, data, pos) {
        let newClass = this.typelist.getClass(data);
        let newNode = new newClass(id, data);
        newNode.parentNode = this.root;
        this.root.add(newNode, pos);
        return newNode;
    }
    create(id, data) {
        let newClass = this.typelist.getClass(data);
        let newNode = new newClass(id, data);
        return newNode;
    }
    draw(painter) {
        this.root.draw(painter, this.pos);
    }
    resize(w, h) {
        this.root.size = new Size(w, h);
    }
    update() {
        this.root.update(this);
    }
}
class VisualJSEngine {
    constructor(workspace) {
        this.workspace = workspace;
    }
}
// Define VNodes
var AlignH;
(function (AlignH) {
    AlignH[AlignH["left"] = 0] = "left";
    AlignH[AlignH["center"] = 0.5] = "center";
    AlignH[AlignH["right"] = 1] = "right";
})(AlignH || (AlignH = {}));
var AlignV;
(function (AlignV) {
    AlignV[AlignV["top"] = 0] = "top";
    AlignV[AlignV["center"] = 0.5] = "center";
    AlignV[AlignV["bottom"] = 1] = "bottom";
})(AlignV || (AlignV = {}));
class VNode {
    constructor(id) {
        this.id = id;
        this.parentNode = null;
        this.alignH = AlignH.left;
        this.alignV = AlignV.top;
    }
    getSize(painter) {
        return new Size(4, 16);
    }
    drawFit(painter, rect) {
        let mySize = this.getSize(painter);
        let offsetX = (rect.w - mySize.w) * this.alignH, offsetY = (rect.h - mySize.h) * this.alignV;
        this.draw(painter, rect.pos.added(new Pos(offsetX, offsetY)));
    }
    draw(painter, pos) {
        painter.drawRect(new Rect(pos, this.getSize(painter)), "#555");
    }
    update(workspace) {
        //
    }
}
class DataNode extends VNode {
    constructor(id, data) {
        super(id);
        this.data = data;
    }
}
class PrimitiveNode extends DataNode {
    constructor(id, data, backgroundColor = "#CCC", borderColor = "#555", textColor = "#333") {
        super(id, data);
        this.vMargin = 4;
        this.hMargin = 5;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.textColor = textColor;
        this.fontSize = 16;
    }
    getSize(painter) {
        painter.ctx.font = "bold " + this.fontSize + "px arial";
        return new Size(painter.ctx.measureText(('' + this.data)).width + 2 * this.hMargin, 16 + 2 * this.vMargin);
    }
    draw(painter, pos) {
        painter.ctx.font = "bold " + this.fontSize + "px arial";
        let size = this.getSize(painter);
        painter.drawRoundRect(new Rect(pos, size), this.backgroundColor, 3);
        painter.strokeRoundRect(new Rect(pos, size), this.borderColor, 2, 3);
        painter.drawText(this.data, new Rect(pos.added(new Pos(0, 2)), size), this.textColor);
    }
}
class StringNode extends PrimitiveNode {
    constructor(id, data) {
        super(id, data, "rgb(160, 212, 196)", "rgb(128, 128, 128)", "rgb(64, 96, 72)");
        this.quoteColor = "rgb(32, 72, 64)";
    }
    getSize(painter) {
        painter.ctx.font = "bold " + this.fontSize + "px arial";
        return new Size(painter.ctx.measureText('""' + this.data).width + 2 * this.hMargin, 16 + 2 * this.vMargin);
    }
    draw(painter, pos) {
        painter.ctx.font = "bold " + this.fontSize + "px arial";
        let quoteWidth = painter.ctx.measureText('"').width;
        let size = this.getSize(painter);
        painter.drawRoundRect(new Rect(pos, size), this.backgroundColor, 3);
        painter.strokeRoundRect(new Rect(pos, size), this.borderColor, 2, 3);
        painter.drawText(this.data, new Rect(pos.added(new Pos(0, 2)), size), this.textColor);
        painter.drawText('"', new Rect(pos.added(new Pos(5, 2)), new Size(quoteWidth, 16)), this.quoteColor);
        painter.drawText('"', new Rect(pos.added(new Pos(quoteWidth + 5 + painter.ctx.measureText(this.data).width, 2)), new Size(quoteWidth, 16)), this.quoteColor);
    }
}
class NumberNode extends PrimitiveNode {
    constructor(id, data) {
        super(id, data, "rgb(128, 160, 212)", "rgb(128, 128, 128)", "rgb(48, 64, 96)");
    }
}
class BooleanNode extends PrimitiveNode {
    constructor(id, data) {
        super(id, data, "rgb(192, 176, 64)", "rgb(128, 128, 128)", "rgb(96, 88, 32)");
    }
}
class NullNode extends PrimitiveNode {
    constructor(id, data) {
        super(id, data, "rgb(160, 80, 48)", "rgb(128, 128, 128)", "rgb(80, 40, 24)");
    }
}
class UndefinedNode extends PrimitiveNode {
    constructor(id, data) {
        super(id, data, "rgb(80, 80, 80)", "rgb(128, 128, 128)", "rgb(50, 50, 50)");
    }
}
class VDivNode extends VNode {
    constructor(id = "", list = []) {
        super(id);
        this.list = list;
        for (let e of this.list) {
            e.parentNode = this;
        }
        this.visible = Visibility.visible;
    }
    getSize(painter) {
        let size = new Size(2, 2);
        for (let elem of this.list) {
            let elemSize = elem.getSize(painter);
            size.w = Math.max(size.w, elemSize.w + 2);
            size.h += elemSize.h + 1;
        }
        return size;
    }
    draw(painter, pos) {
        if (this.visible == Visibility.none)
            return;
        if (this.visible != Visibility.contents) {
            painter.drawRect(new Rect(pos, this.getSize(painter)), "#fff");
            painter.strokeRect(new Rect(pos, this.getSize(painter)), "#555");
        }
        let cPos = pos.added(new Pos(1, 1));
        let maxWidth = this.getSize(painter).w;
        for (let elem of this.list) {
            let elemSize = elem.getSize(painter);
            elem.drawFit(painter, new Rect(cPos, new Size(maxWidth, elemSize.h)));
            cPos.y += elemSize.h + 1;
        }
    }
    add(node) {
        this.list.push(node);
        node.parentNode = this;
        return this;
    }
    remove(i) {
        let del = this.list.splice(i, 1)[0];
        del.parentNode = null;
        return del;
    }
    clear() {
        this.list = [];
    }
    update(workspace) {
        for (let elem of this.list) {
            elem.update(workspace);
        }
    }
}
class HDivNode extends VNode {
    constructor(id = "", list = []) {
        super(id);
        this.list = list;
        this.visible = Visibility.visible;
    }
    getSize(painter) {
        let size = new Size(2, 2);
        for (let elem of this.list) {
            let elemSize = elem.getSize(painter);
            size.w += elemSize.w + 1;
            size.h = Math.max(size.h, elemSize.h + 2);
        }
        return size;
    }
    draw(painter, pos) {
        if (this.visible == Visibility.none)
            return;
        if (this.visible != Visibility.contents) {
            painter.drawRect(new Rect(pos, this.getSize(painter)), "#fff");
            painter.strokeRect(new Rect(pos, this.getSize(painter)), "#555");
        }
        let cPos = pos.added(new Pos(1, 0));
        let maxHeight = this.getSize(painter).h;
        for (let elem of this.list) {
            let elemSize = elem.getSize(painter);
            elem.drawFit(painter, new Rect(cPos, new Size(elemSize.w, maxHeight)));
            cPos.x += elemSize.w + 1;
        }
    }
    add(node) {
        this.list.push(node);
        node.parentNode = this;
        return this;
    }
    remove(i) {
        let del = this.list.splice(i, 1)[0];
        del.parentNode = null;
        return del;
    }
    clear() {
        for (let e of this.list) {
            e.parentNode = null;
        }
        this.list = [];
    }
    update(workspace) {
        for (let elem of this.list) {
            elem.update(workspace);
        }
    }
}
class ReferenceNode extends DataNode {
    constructor(id, data, subnode = new BorderNode()) {
        super(id, data);
        let bnode = new BorderNode(subnode);
        bnode.parentNode = this;
        this.subnode = bnode;
    }
    setColor(bgCol = "#DDD", borderCol = "888") {
        this.subnode.backgroundColor = bgCol;
        this.subnode.borderColor = borderCol;
    }
    setMargin(horizontal = 2, vertical = 2) {
        this.subnode.hMargin = horizontal;
        this.subnode.vMargin = vertical;
    }
    getSize(painter) {
        return this.subnode.getSize(painter);
    }
    draw(painter, pos) {
        this.subnode.draw(painter, pos);
    }
    drawFit(painter, rect) {
        this.subnode.drawFit(painter, rect);
    }
    update(workspace) {
        this.subnode.update(workspace);
    }
}
var Visibility;
(function (Visibility) {
    Visibility[Visibility["visible"] = 0] = "visible";
    Visibility[Visibility["contents"] = 1] = "contents";
    Visibility[Visibility["none"] = 2] = "none";
})(Visibility || (Visibility = {}));
class DivNode extends VNode {
    constructor(id = "", subnode = null) {
        super(id);
        this.subnode = subnode;
        if (subnode) {
            subnode.parentNode = this;
        }
        this.margin = {
            left: 2,
            right: 2,
            top: 2,
            bottom: 2
        };
        this.backgroundColor = "rgba(0, 0, 0, 0)";
        this.borderColor = "rgba(0, 0, 0, 0)";
        this.borderWidth = 1;
        this.visible = Visibility.visible;
    }
    getSize(painter) {
        if (this.subnode == null)
            return new Size(this.margin.left + this.margin.right, this.margin.top + this.margin.bottom);
        let subSize = this.subnode.getSize(painter);
        return new Size(subSize.w + this.margin.left + this.margin.right, subSize.h + this.margin.top + this.margin.bottom);
    }
    draw(painter, pos) {
        if (this.visible == Visibility.none)
            return;
        let size = this.getSize(painter);
        if (this.visible != Visibility.contents) {
            painter.drawRect(new Rect(pos, size), this.backgroundColor);
            painter.strokeRect(new Rect(pos, size), this.borderColor, this.borderWidth);
        }
        if (this.subnode) {
            this.subnode.drawFit(painter, new Rect(pos.added(new Pos(this.margin.left, this.margin.right)), this.subnode.getSize(painter)));
        }
    }
    setSubnode(node) {
        this.subnode = node;
        node.parentNode = this;
        return this;
    }
    update(workspace) {
        if (!this.subnode)
            return;
        this.subnode.update(workspace);
    }
}
class Placeholder extends VNode {
    constructor(w, h, id = "") {
        super(id);
        this.size = new Size(w, h);
    }
    getSize(painter) {
        return this.size;
    }
    draw(painter, pos) {
        return;
    }
}
class TextNode extends VNode {
    constructor(text, font = "16px arial", col = "#000", id = "", hMargin = 2, vMargin = 2) {
        super(id);
        this.text = text;
        this.font = font;
        this.textColor = col;
        this.hMargin = hMargin;
        this.vMargin = vMargin;
        this.font = font;
    }
    getSize(painter) {
        painter.ctx.font = this.font;
        return new Size(painter.ctx.measureText(this.text).width + 2 * this.hMargin, 16 + 2 * this.vMargin);
    }
    draw(painter, pos) {
        painter.ctx.font = this.font;
        let size = this.getSize(painter);
        painter.ctx.font = this.font;
        painter.drawText(this.text, new Rect(pos.added(new Pos(0, -1)), size), this.textColor);
    }
}
class FrameElement {
    constructor(node, pos) {
        this.node = node;
        this.pos = pos;
    }
}
class FrameNode extends VNode {
    constructor(id, size) {
        super(id);
        this.size = size;
        this.list = [];
    }
    add(node, pos = new Pos(0, 0)) {
        this.list.push(new FrameElement(node, pos));
        node.parentNode = this;
    }
    remove(node) {
        let ind = this.list.findIndex(x => (x.node === node));
        if (ind != -1) {
            let rnode = this.list.splice(ind, 1)[0];
            rnode.node.parentNode = null;
            return rnode;
        }
    }
    move(node, pos) {
        let ind = this.list.findIndex(x => (x.node === node));
        if (ind != -1) {
            let rnode = this.list[ind];
            rnode.pos = pos;
        }
    }
    update(workspace) {
        for (let elem of this.list) {
            elem.node.update(workspace);
        }
    }
    draw(painter, pos) {
        for (let elem of this.list) {
            elem.node.draw(painter, pos.added(elem.pos));
        }
    }
}
class BorderNode extends VNode {
    constructor(subnode = null, bgCol = "#DDD", borderCol = "#888", vMargin = 2, hMargin = 2, id = "") {
        super(id);
        this.vMargin = vMargin;
        this.hMargin = hMargin;
        this.backgroundColor = bgCol;
        this.borderColor = borderCol;
        this.subnode = subnode;
        if (subnode) {
            subnode.parentNode = this;
        }
    }
    getSize(painter) {
        if (this.subnode == null)
            return new Size(2 * this.hMargin, 2 * this.vMargin);
        let subSize = this.subnode.getSize(painter);
        return new Size(subSize.w + 2 * this.hMargin, subSize.h + 2 * this.vMargin);
    }
    draw(painter, pos) {
        let size = this.getSize(painter);
        painter.drawRoundRect(new Rect(pos, size), this.backgroundColor, 3);
        painter.strokeRoundRect(new Rect(pos, size), this.borderColor, 2, 3);
        if (this.subnode) {
            this.subnode.drawFit(painter, new Rect(pos.added(new Pos(this.hMargin, this.vMargin)), this.subnode.getSize(painter)));
        }
    }
    setSubnode(node) {
        this.subnode = node;
        node.parentNode = this;
        return this;
    }
    update(workspace) {
        if (!this.subnode)
            return;
        this.subnode.update(workspace);
    }
}
class ObjectNode extends ReferenceNode {
    constructor(id, data) {
        super(id, data);
        let tnode = new TextNode(data.constructor.name);
        let vnode = new VDivNode("", [tnode]);
        let bnode = new BorderNode(vnode);
        this.subnode = bnode;
    }
    update(workspace) {
        let vnode = this.subnode.subnode;
        vnode.clear();
        let dnode = new DivNode("", new TextNode(this.data.constructor.name, "28px arial", "#555", "", 8, 8));
        vnode.add(dnode);
        for (let key in this.data) {
            if (key == "parentNode")
                continue; // for test
            let hnode = new HDivNode("", [
                new TextNode(key, "bold 16px arial", "#999", "", 5, 5),
                workspace.create("", this.data[key])
            ]);
            hnode.visible = Visibility.contents;
            vnode.add(hnode);
        }
        if (!this.subnode)
            return;
        this.subnode.update(workspace);
    }
}
class ArrayNode extends ReferenceNode {
    constructor(id, data) {
        super(id, data);
        let hdiv = new HDivNode("");
        let ddiv = new DivNode("", hdiv);
        this.subnode.setSubnode(ddiv);
        hdiv.visible = Visibility.contents;
        ddiv.visible = Visibility.contents;
        this.brackets = [];
        let tnlb = new TextNode("[", "bold 24px arial", "#555", "", 3, 0);
        let tnrb = new TextNode("]", "bold 24px arial", "#555", "", 3, 0);
        tnlb.parentNode = this;
        tnrb.parentNode = this;
        tnlb.alignH = AlignH.center;
        tnrb.alignH = AlignH.center;
        tnlb.alignV = AlignV.center;
        tnrb.alignV = AlignV.center;
        this.brackets.push(tnlb);
        this.brackets.push(tnrb);
        this.elements = [];
    }
    update(workspace) {
        let hdiv = this.subnode.subnode.subnode;
        let newElemList = [];
        for (let i in this.data) {
            let elem = this.data[i];
            let match = this.elements.find(x => (x.data === elem));
            if (match) {
                newElemList.push(match);
            }
            else {
                let newType = workspace.typelist.getClass(elem);
                let newNode = new newType('' + i, elem);
                newElemList.push(newNode);
                newNode.parentNode = this;
            }
        }
        this.elements = newElemList;
        hdiv.clear();
        hdiv.add(this.brackets[0]);
        for (let e of this.elements) {
            hdiv.add(e);
            e.alignH = AlignH.center;
            e.alignV = AlignV.center;
            hdiv.add(new Placeholder(12, 12));
        }
        if (hdiv.list.length != 0) {
            hdiv.remove(hdiv.list.length - 1);
        }
        hdiv.add(this.brackets[1]);
        this.subnode.update(workspace);
    }
    draw(painter, pos) {
        this.subnode.draw(painter, pos);
    }
}
/*
 * Second File
 */
const canvas = document.getElementById("main");
const vjsWorkspace = new VisualJSWorkspace(canvas);
const vjsEngine = new VisualJSEngine(vjsWorkspace);
const vpainter = vjsWorkspace.painter;
vjsWorkspace.addType("String", StringNode);
vjsWorkspace.addType("Number", NumberNode);
vjsWorkspace.addType("Boolean", BooleanNode);
vjsWorkspace.addType("Array", ArrayNode);
function refreshScreen() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    vjsWorkspace.resize(canvas.width, canvas.height);
    vjsWorkspace.update();
    vjsWorkspace.draw(vpainter);
}
window.addEventListener("resize", refreshScreen, false);
vjsWorkspace.add("", ["hi", 51, [false, 3, "bool"]], new Pos(32, 32));
vjsWorkspace.add("", { a: 3, b: "hi" }, new Pos(32, 256));
vjsWorkspace.add("", vjsWorkspace.root.list[0].node, new Pos(32, 512));
refreshScreen();
