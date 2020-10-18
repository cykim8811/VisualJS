
// Type Definition

class Pos{
    x: number;
    y: number;
    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }
    added(pos: Pos){
        return new Pos(this.x + pos.x, this.y + pos.y);
    }
}

class Size{
    w: number;
    h: number;
    constructor(w: number, h: number){
        this.w = w;
        this.h = h;
    }
}

class Rect{
    pos: Pos;
    size: Size;
    constructor(pos: Pos, size: Size){
        this.pos = pos;
        this.size = size;
    }
    get x() {return this.pos.x;}
    get y() {return this.pos.y;}
    get w() {return this.size.w;}
    get h() {return this.size.h;}
    get center() {return this.pos.added(new Pos(this.size.w * 0.5, this.size.h * 0.5));}
    setSize(size:Size){this.size=size;return this;}
    setPos(pos:Pos){this.pos=pos;return this;}
}

// VisualJS

class VisualJSPainter{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    }
    drawRect(rect: Rect, col: string="#CCC"){
        this.ctx.fillStyle = col;
        this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    strokeRect(rect: Rect, col: string="#CCC", width: number=1){
        this.ctx.strokeStyle = col;
        this.ctx.lineWidth = width;
        this.ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    drawRoundRect(rect: Rect, col: string="#CCC", r=3){
        if (rect.w <= r * 2 || rect.h <= r * 2){
            this.drawRect(rect, col);
            return;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(rect.x+r, rect.y);
        this.ctx.lineTo(rect.x+rect.w-r, rect.y);
        this.ctx.quadraticCurveTo(rect.x+rect.w, rect.y, rect.x+rect.w, rect.y+r);
        this.ctx.lineTo(rect.x+rect.w, rect.y+rect.h-r);
        this.ctx.quadraticCurveTo(rect.x+rect.w, rect.y+rect.h, rect.x+rect.w-r, rect.y+rect.h);
        this.ctx.lineTo(rect.x+r, rect.y+rect.h);
        this.ctx.quadraticCurveTo(rect.x, rect.y+rect.h, rect.x, rect.y+rect.h-r);
        this.ctx.lineTo(rect.x, rect.y+r);
        this.ctx.quadraticCurveTo(rect.x, rect.y, rect.x+r, rect.y);
        this.ctx.fillStyle = col;
        this.ctx.fill();
    }
    strokeRoundRect(rect: Rect, col: string="#CCC", width: number = 1, r: number=3){
        if (rect.w <= r * 2 || rect.h <= r * 2){
            this.strokeRect(rect, col);
            return;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(rect.x+r, rect.y);
        this.ctx.lineTo(rect.x+rect.w-r, rect.y);
        this.ctx.quadraticCurveTo(rect.x+rect.w, rect.y, rect.x+rect.w, rect.y+r);
        this.ctx.lineTo(rect.x+rect.w, rect.y+rect.h-r);
        this.ctx.quadraticCurveTo(rect.x+rect.w, rect.y+rect.h, rect.x+rect.w-r, rect.y+rect.h);
        this.ctx.lineTo(rect.x+r, rect.y+rect.h);
        this.ctx.quadraticCurveTo(rect.x, rect.y+rect.h, rect.x, rect.y+rect.h-r);
        this.ctx.lineTo(rect.x, rect.y+r);
        this.ctx.quadraticCurveTo(rect.x, rect.y, rect.x+r, rect.y);
        this.ctx.strokeStyle = col;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }
    drawText(text: string, at: Rect, col: string="#333", font: string=""){
        this.ctx.fillStyle = col;
        this.ctx.font = font;
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, at.x + at.w/2, at.y + at.h/2);
    }
}

class Typedef{
    typeclass: typeof DataNode;
    typename: string;
    constructor(typename: string, typeclass: typeof DataNode){
        this.typename = typename;
        this.typeclass = typeclass;
    }
}

class TypeList{
    list: Typedef[];
    constructor(){
        this.list = [];
    }
    getClass(data: any){
        if (data == null) return NullNode;
        if (data == undefined) return UndefinedNode;
        let typename = data.constructor.name;
        for (let td of this.list){
            if (td.typename == typename){
                return td.typeclass;
            }
        }
        return ObjectNode;
    }
    add(typename: string, typeclass: typeof DataNode){
        this.list.push(new Typedef(typename, typeclass));
    }
}

class VisualJSWorkspace{
    painter: VisualJSPainter;
    typelist: TypeList;
    root: FrameNode;
    pos: Pos;
    constructor(canvas: HTMLCanvasElement){
        this.painter = new VisualJSPainter(canvas);
        this.typelist = new TypeList();
        this.root = new FrameNode("root", new Size(this.painter.canvas.width, this.painter.canvas.height));
        this.pos = new Pos(0, 0);
    }
    addType(typename: string, typeclass: typeof DataNode){
        this.typelist.add(typename, typeclass);
    }
    add(id: string, data: any, pos: Pos){
        let newClass = this.typelist.getClass(data);
        let newNode = new newClass(id, data);
        newNode.parentNode = this.root;
        this.root.add(newNode, pos);
        return newNode;
    }
    create(id: string, data: any){
        let newClass = this.typelist.getClass(data);
        let newNode = new newClass(id, data);
        return newNode;
    }
    draw(painter: VisualJSPainter){
        this.root.draw(painter, this.pos);
    }
    resize(w: number, h: number){
        this.root.size = new Size(w, h);
    }
    update(){
        this.root.update(this);
    }
}

class VisualJSEngine{
    workspace: VisualJSWorkspace;
    constructor(workspace: VisualJSWorkspace){
        this.workspace = workspace;
    }
}

// Define VNodes

enum AlignH {left=0, center=0.5, right=1}
enum AlignV {top=0, center=0.5, bottom=1}

class VNode{
    id: string;
    parentNode: VNode|null;
    alignH: AlignH;
    alignV: AlignV;
    constructor(id: string){
        this.id = id;
        this.parentNode = null;

        this.alignH = AlignH.left;
        this.alignV = AlignV.top;
    }
    getSize(painter: VisualJSPainter): Size{
        return new Size(4, 16);
    }
    drawFit(painter: VisualJSPainter, rect: Rect){
        let mySize = this.getSize(painter);

        let offsetX = (rect.w - mySize.w) * this.alignH,
            offsetY = (rect.h - mySize.h) * this.alignV;
        this.draw(painter, rect.pos.added(new Pos(offsetX, offsetY)));
    }
    draw(painter: VisualJSPainter, pos: Pos){
        painter.drawRect(new Rect(pos, this.getSize(painter)), "#555");
    }
    update(workspace: VisualJSWorkspace){
        //
    }
}

class DataNode extends VNode{
    data: any;
    constructor(id: string, data: any){
        super(id);
        this.data = data;
    }
}

class PrimitiveNode extends DataNode{
    vMargin: number;
    hMargin: number;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    fontSize: number;
    constructor(id: string, data: any, backgroundColor: string = "#CCC", borderColor: string = "#555", textColor: string = "#333"){
        super(id, data);
        this.vMargin = 4;
        this.hMargin = 5;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.textColor = textColor;
        this.fontSize = 16;
    }
    getSize(painter: VisualJSPainter): Size{
        painter.ctx.font = "bold " + this.fontSize + "px arial";
        return new Size(painter.ctx.measureText((''+this.data)).width + 2 * this.hMargin, 16 + 2 * this.vMargin);
    }
    draw(painter: VisualJSPainter, pos: Pos){
        painter.ctx.font = "bold " + this.fontSize + "px arial";
        let size = this.getSize(painter);
        painter.drawRoundRect(new Rect(pos, size), this.backgroundColor, 3);
        painter.strokeRoundRect(new Rect(pos, size), this.borderColor, 2, 3);
        painter.drawText(this.data, new Rect(pos.added(new Pos(0, 2)), size), this.textColor);
    }
}

class StringNode extends PrimitiveNode{
    quoteColor: string;
    constructor(id: string, data: string){
        super(id, data, "rgb(160, 212, 196)", "rgb(128, 128, 128)", "rgb(64, 96, 72)");
        this.quoteColor = "rgb(32, 72, 64)";
    }
    getSize(painter: VisualJSPainter): Size{
        painter.ctx.font = "bold " + this.fontSize + "px arial";
        return new Size(painter.ctx.measureText('""'+this.data).width + 2 * this.hMargin, 16 + 2 * this.vMargin);
    }
    draw(painter: VisualJSPainter, pos: Pos){
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

class NumberNode extends PrimitiveNode{
    constructor(id: string, data: number){
        super(id, data, "rgb(128, 160, 212)", "rgb(128, 128, 128)", "rgb(48, 64, 96)");
    }
}

class BooleanNode extends PrimitiveNode{
    constructor(id: string, data: boolean){
        super(id, data, "rgb(192, 176, 64)", "rgb(128, 128, 128)", "rgb(96, 88, 32)");
    }
}

class NullNode extends PrimitiveNode{
    constructor(id: string, data: boolean){
        super(id, data, "rgb(160, 80, 48)", "rgb(128, 128, 128)", "rgb(80, 40, 24)");
    }
}

class UndefinedNode extends PrimitiveNode{
    constructor(id: string, data: boolean){
        super(id, data, "rgb(80, 80, 80)", "rgb(128, 128, 128)", "rgb(50, 50, 50)");
    }
}

class VDivNode extends VNode{
    list: Array<VNode>;
    visible: Visibility;
    constructor(id: string = "", list: Array<VNode> = []){
        super(id);
        this.list = list;
        for (let e of this.list){
            e.parentNode = this;
        }
        this.visible = Visibility.visible;
    }
    getSize(painter: VisualJSPainter){
        let size = new Size(2, 2);
        for (let elem of this.list){
            let elemSize = elem.getSize(painter);
            size.w = Math.max(size.w, elemSize.w + 2);
            size.h += elemSize.h + 1;
        }
        return size;
    }
    draw(painter: VisualJSPainter, pos: Pos){
        if (this.visible == Visibility.none) return;
        if (this.visible != Visibility.contents){
            painter.drawRect(new Rect(pos, this.getSize(painter)), "#fff");
            painter.strokeRect(new Rect(pos, this.getSize(painter)), "#555");
        }
        let cPos = pos.added(new Pos(1, 1));
        let maxWidth = this.getSize(painter).w;
        for (let elem of this.list){
            let elemSize = elem.getSize(painter);
            elem.drawFit(painter, new Rect(cPos, new Size(maxWidth, elemSize.h)));
            cPos.y += elemSize.h + 1;
        }
    }
    add(node: VNode){
        this.list.push(node);
        node.parentNode = this;
        return this;
    }
    remove(i: number){
        let del = this.list.splice(i, 1)[0]
        del.parentNode = null;
        return del;
    }
    clear(){
        this.list = [];
    }
    update(workspace: VisualJSWorkspace){
        for (let elem of this.list){
            elem.update(workspace);
        }
    }
}
class HDivNode extends VNode{
    list: Array<VNode>;
    visible: Visibility;
    constructor(id: string = "", list: Array<VNode> = []){
        super(id);
        this.list = list;
        this.visible = Visibility.visible;
    }
    getSize(painter: VisualJSPainter){
        let size = new Size(2, 2);
        for (let elem of this.list){
            let elemSize = elem.getSize(painter);
            size.w += elemSize.w + 1;
            size.h = Math.max(size.h, elemSize.h + 2);
        }
        return size;
    }
    draw(painter: VisualJSPainter, pos: Pos){
        if (this.visible == Visibility.none) return;
        if (this.visible != Visibility.contents){
            painter.drawRect(new Rect(pos, this.getSize(painter)), "#fff");
            painter.strokeRect(new Rect(pos, this.getSize(painter)), "#555");
        }
        let cPos = pos.added(new Pos(1, 0));
        let maxHeight = this.getSize(painter).h;
        for (let elem of this.list){
            let elemSize = elem.getSize(painter);
            elem.drawFit(painter, new Rect(cPos, new Size(elemSize.w, maxHeight)));
            cPos.x += elemSize.w + 1;
        }
    }
    add(node: VNode){
        this.list.push(node);
        node.parentNode = this;
        return this;
    }
    remove(i: number){
        let del = this.list.splice(i, 1)[0]
        del.parentNode = null;
        return del;
    }
    clear(){
        for (let e of this.list){
            e.parentNode = null;
        }
        this.list = [];
    }
    update(workspace: VisualJSWorkspace){
        for (let elem of this.list){
            elem.update(workspace);
        }
    }
}

class ReferenceNode extends DataNode{
    data: any;
    subnode: BorderNode;
    constructor(id: string, data: any, subnode: VNode = new BorderNode()){
        super(id, data);
        let bnode = new BorderNode(subnode);
        bnode.parentNode = this;
        this.subnode = bnode;
    }
    setColor(bgCol: string = "#DDD", borderCol: string = "888"){
        this.subnode.backgroundColor = bgCol;
        this.subnode.borderColor = borderCol;
    }
    setMargin(horizontal: number = 2, vertical: number = 2){
        this.subnode.hMargin = horizontal;
        this.subnode.vMargin = vertical;
    }
    getSize(painter: VisualJSPainter){
        return this.subnode.getSize(painter);
    }
    draw(painter: VisualJSPainter, pos: Pos){
        this.subnode.draw(painter, pos);
    }
    drawFit(painter: VisualJSPainter, rect: Rect){
        this.subnode.drawFit(painter, rect);
    }
    update(workspace: VisualJSWorkspace){
        this.subnode.update(workspace);
    }
}

interface Margin{
    left: number,
    right: number,
    top: number,
    bottom: number,
}

enum Visibility {visible, contents, none}

class DivNode extends VNode{
    backgroundColor: string;
    borderColor: string;
    margin: Margin;
    subnode: VNode|null;
    borderWidth: number;
    visible: Visibility;
    constructor(id: string = "", subnode: VNode|null = null){
        super(id);
        this.subnode = subnode;
        if (subnode) {subnode.parentNode = this;}
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
    getSize(painter: VisualJSPainter): Size{
        if (this.subnode == null) return new Size(this.margin.left + this.margin.right, this.margin.top + this.margin.bottom);
        let subSize = this.subnode.getSize(painter);
        return new Size(subSize.w + this.margin.left + this.margin.right, subSize.h + this.margin.top + this.margin.bottom);
    }
    draw(painter: VisualJSPainter, pos: Pos){
        if (this.visible == Visibility.none) return;
        let size = this.getSize(painter);
        if (this.visible != Visibility.contents){
            painter.drawRect(new Rect(pos, size), this.backgroundColor);
            painter.strokeRect(new Rect(pos, size), this.borderColor, this.borderWidth);
        }
        if (this.subnode){
            this.subnode.drawFit(
                painter,
                new Rect(pos.added(new Pos(this.margin.left, this.margin.right)), this.subnode.getSize(painter))
            );
        }
    }
    setSubnode(node: VNode){
        this.subnode = node;
        node.parentNode = this;
        return this;
    }
    update(workspace: VisualJSWorkspace){
        if (!this.subnode) return;
        this.subnode.update(workspace);
    }
}

class Placeholder extends VNode{
    size: Size;
    constructor(w: number, h: number, id: string=""){
        super(id);
        this.size = new Size(w, h);
    }
    getSize(painter: VisualJSPainter){
        return this.size;
    }
    draw(painter: VisualJSPainter, pos: Pos){
        return;
    }
}

class TextNode extends VNode{
    text: string;
    textColor: string;
    hMargin: number;
    vMargin: number;
    font: string;
    constructor(text: string, font: string = "16px arial", col: string = "#000", id: string = "", hMargin: number = 2, vMargin: number = 2){
        super(id);
        this.text = text;
        this.font = font;
        this.textColor = col;
        this.hMargin = hMargin;
        this.vMargin = vMargin;
        this.font = font;
    }
    getSize(painter: VisualJSPainter): Size{
        painter.ctx.font = this.font;
        return new Size(painter.ctx.measureText(this.text).width + 2 * this.hMargin, 16 + 2 * this.vMargin);
    }
    draw(painter: VisualJSPainter, pos: Pos){
        painter.ctx.font = this.font;
        let size = this.getSize(painter);
        painter.ctx.font = this.font;
        painter.drawText(this.text, new Rect(pos.added(new Pos(0, -1)), size), this.textColor);
    }
}

class FrameElement{
    node: VNode;
    pos: Pos;
    constructor(node: VNode, pos: Pos){
        this.node = node;
        this.pos = pos;
    }
}

class FrameNode extends VNode{
    size: Size;
    list: FrameElement[];
    constructor(id: string, size: Size){
        super(id);
        this.size = size;
        this.list = [];
    }
    add(node: VNode, pos: Pos = new Pos(0, 0)){
        this.list.push(new FrameElement(node, pos));
        node.parentNode = this;
    }
    remove(node: VNode){
        let ind = this.list.findIndex(x=>(x.node === node));
        if (ind != -1){
            let rnode = this.list.splice(ind, 1)[0];
            rnode.node.parentNode = null;
            return rnode;
        }
    }
    move(node: VNode, pos: Pos){
        let ind = this.list.findIndex(x=>(x.node === node));
        if (ind != -1){
            let rnode = this.list[ind];
            rnode.pos = pos;
        }
    }
    update(workspace: VisualJSWorkspace){
        for (let elem of this.list){
            elem.node.update(workspace);
        }
    }
    draw(painter: VisualJSPainter, pos: Pos){
        for (let elem of this.list){
            elem.node.draw(painter, pos.added(elem.pos));
        }
    }
}

class BorderNode extends VNode{
    vMargin: number;
    hMargin: number;
    backgroundColor: string;
    borderColor: string;
    subnode: VNode|null;
    constructor(subnode: VNode|null = null, bgCol: string = "#DDD", borderCol: string = "#888", vMargin: number = 2, hMargin: number = 2, id: string = ""){
        super(id);
        this.vMargin = vMargin;
        this.hMargin = hMargin;
        this.backgroundColor = bgCol;
        this.borderColor = borderCol;
        this.subnode = subnode;
        if (subnode) {subnode.parentNode = this;}
    }
    getSize(painter: VisualJSPainter): Size{
        if (this.subnode == null) return new Size(2 * this.hMargin, 2 * this.vMargin);
        let subSize = this.subnode.getSize(painter);
        return new Size(subSize.w + 2 * this.hMargin, subSize.h + 2 * this.vMargin);
    }
    draw(painter: VisualJSPainter, pos: Pos){
        let size = this.getSize(painter);
        painter.drawRoundRect(new Rect(pos, size), this.backgroundColor, 3);
        painter.strokeRoundRect(new Rect(pos, size), this.borderColor, 2, 3);
        if (this.subnode){
            this.subnode.drawFit(
                painter,
                new Rect(pos.added(new Pos(this.hMargin, this.vMargin)), this.subnode.getSize(painter))
            );
        }
    }
    setSubnode(node: VNode){
        this.subnode = node;
        node.parentNode = this;
        return this;
    }
    update(workspace: VisualJSWorkspace){
        if (!this.subnode) return;
        this.subnode.update(workspace);
    }
}

class ObjectNode extends ReferenceNode{
    constructor(id: string, data: Object){
        super(id, data);
        let tnode = new TextNode(data.constructor.name);
        let vnode = new VDivNode("", [tnode]);
        let bnode = new BorderNode(vnode);
        this.subnode = bnode;
    }
    update(workspace: VisualJSWorkspace){
        let vnode = (<VDivNode>this.subnode.subnode);
        vnode.clear();
        let dnode = new DivNode("", new TextNode(this.data.constructor.name, "28px arial", "#555", "", 8, 8));
        vnode.add(dnode);
        for (let key in this.data){
            if (key == "parentNode") continue; // for test
            let hnode = new HDivNode("", [
                new TextNode(key, "bold 16px arial", "#999", "", 5, 5),
                workspace.create("", this.data[key])
            ]);
            hnode.visible = Visibility.contents;
            vnode.add(hnode);
        }
        if (!this.subnode) return;
        this.subnode.update(workspace);
    }
}

class ArrayNode extends ReferenceNode{
    brackets: Array<TextNode>;      // Two brackets
    elements: Array<DataNode>;      // Nodes
    constructor(id: string, data: Array<any>){
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
    update(workspace: VisualJSWorkspace){
        let hdiv = <HDivNode>(<DivNode>this.subnode.subnode).subnode;
        let newElemList: DataNode[] = [];
        for (let i in this.data){
            let elem = this.data[i];
            let match = this.elements.find(x=>(x.data===elem));
            if (match){
                newElemList.push(match);
            }else{
                let newType = workspace.typelist.getClass(elem);
                let newNode = new newType(''+i, elem);
                newElemList.push(newNode);
                newNode.parentNode = this;
            }
        }
        this.elements = newElemList;
        hdiv.clear();
        hdiv.add(this.brackets[0]);
        for (let e of this.elements){
            hdiv.add(e);
            e.alignH = AlignH.center;
            e.alignV = AlignV.center;
            hdiv.add(new Placeholder(12, 12));
        }
        if (hdiv.list.length != 0) { hdiv.remove(hdiv.list.length - 1); }
        hdiv.add(this.brackets[1]);
        this.subnode.update(workspace);
    }
    draw(painter: VisualJSPainter, pos: Pos){
        this.subnode.draw(painter, pos);
    }
}

/*
 * Second File
 */

const canvas = <HTMLCanvasElement>document.getElementById("main");
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
vjsWorkspace.add("", {a:3, b:"hi"}, new Pos(32, 256));
vjsWorkspace.add("", vjsWorkspace.root.list[0].node, new Pos(32, 512));
refreshScreen();
