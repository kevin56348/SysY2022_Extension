import { Position, Range } from "vscode";
import { DefsInside } from "../language/ASTTest.js";

interface Node {
    name: string; // ident name
    position: Position; // line number
    level: number; //hierarchy
    func_name: string; // in which function
    range: Range; // vaild range
    type: string;
    funcfparam?: string[];
}

export class IdentTable {
    public nodes: Node[];

    constructor() {
        this.nodes = [];
    }

    add(name: string, position: Position, level: number, func_name: string, range: Range, type: string, funcfparam?: string[]) {
        this.nodes.push({ name, position, level, func_name, range, type, funcfparam });
    }

    add_arr(arr: [string, Position, number, string, Range, string, string[] | undefined]) {
        this.nodes.push({
            name: arr[0], 
            position: arr[1], 
            level: arr[2], 
            func_name: arr[3], 
            range: arr[4],
            type: arr[5],
            funcfparam: arr[6]
        });
    }

    add_arrs(arrs: [string, Position, number, string, Range, string, string[] | undefined][]): Node[] {
        this.clear();
        arrs.forEach(arr=>{
            this.nodes.push({
                name: arr[0], 
                position: arr[1], 
                level: arr[2], 
                func_name: arr[3], 
                range: arr[4],
                type: arr[5],
                funcfparam: arr[6]
            });
        });
        return this.nodes;
    }

    add_arrs_DI(arrs: DefsInside[]) {
        this.clear();
        arrs.forEach(di=>{
            this.nodes.push({
                name: di.ident, 
                position: di.pos, 
                level: di.lv, 
                func_name: di.belong_to, 
                range: di.range,
                type: di.type as string,
                funcfparam: di.funcfparam
            });
        });
    }

    clear(){
        this.nodes = [];
    }

    match(testnode: Node) {
        return this.nodes.some(node => {
            // console.log(node.name, testnode.name);
            // console.log(node.position.isBefore(testnode.position));
            // console.log(node.level, testnode.level)
            // console.log(node.func_name, testnode.func_name);
            // console.log(node.range, testnode.range);
            return node.name === testnode.name
                && node.position.isBefore(testnode.position)
                && node.level <= testnode.level
                // && (node.func_name == testnode.func_name || testnode.func_name == '')
                && node.range.start.isBefore(testnode.range.start)
                && node.range.end.isAfter(testnode.range.end);
        });
    }

    getnode():Node[]{
        return this.nodes;
    }

    isshadow(testnode:Node){
        let line = -1;
        let num = 0;
        this.nodes.forEach(node => {
            if (node.name === testnode.name && node.range.contains(testnode.range) && node !== testnode){
                num = num + 1;
                line = node.position.line;
            }
        });
        return line;
    }

    ps_match(testnode: Node) {
        return this.nodes.some(node => {
            if (node.funcfparam) {
                // console.warn(node.funcfparam.length);
                // console.log(testnode.funcfparam?.length);
                if (node.funcfparam.length === testnode.funcfparam?.length) {
                    return node.name === testnode.name
                        && node.position.isBefore(testnode.position)
                        && node.level <= testnode.level
                        // && (node.func_name == testnode.func_name || testnode.func_name == '')
                        && node.range.start.isBefore(testnode.range.start)
                        && node.range.end.isAfter(testnode.range.end);
                }
            }
            return false;
        });
    }
}
