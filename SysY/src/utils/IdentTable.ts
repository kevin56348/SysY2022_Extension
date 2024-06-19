import { Position, Range } from "vscode";
import { DefsInside } from "../language/ASTTest.js";

interface Node {
    name: string; // ident name
    position: Position; // line number
    level: number; //hierarchy
    func_name: string; // in which function
    range: Range; // vaild range
}

export class IdentTable {
    private nodes: Node[];

    constructor() {
        this.nodes = [];
    }

    add(name: string, position: Position, level: number, func_name: string, range: Range) {
        this.nodes.push({ name, position, level, func_name, range });
    }

    add_arr(arr: [string, Position, number, string, Range]) {
        this.nodes.push({
            name: arr[0], 
            position: arr[1], 
            level: arr[2], 
            func_name: arr[3], 
            range: arr[4]
        });
    }

    add_arrs(arrs: Promise<[string, Position, number, string, Range][]>): Node[] {
        this.clear();
        arrs.then(
            res => {
                res.forEach(arr=>{
                    this.nodes.push({
                        name: arr[0], 
                        position: arr[1], 
                        level: arr[2], 
                        func_name: arr[3], 
                        range: arr[4]
                    });
                });
                
            }
        )
        return this.nodes;
    }

    add_arrs_DI(arrs: Promise<DefsInside[]>): Node[] {
        this.clear();
        arrs.then(
            res => {
                res.forEach(di=>{
                    this.nodes.push({
                        name: di.ident, 
                        position: di.pos, 
                        level: di.lv, 
                        func_name: di.belong_to, 
                        range: di.range
                    });
                });
                
            }
        )
        return this.nodes;
    }

    clear(){
        this.nodes = [];
    }

    match(testnode:Node){
        return this.nodes.some(node => 
            node.name === testnode.name 
            && node.position.isBefore(testnode.position)
            && node.level <= testnode.level
            && (node.func_name == testnode.func_name || testnode.func_name == '')
            && node.range.start.isBefore(testnode.range.start)
            && node.range.end.isAfter(testnode.range.end)
        );
    }

    getnode():Node[]{
        return this.nodes;
    }
}
