interface Node {
    name: string; // ident name
    line_num: number; // line number
    level: number; //hierarchy
    func_name: string; // in which function
    ident_type: string; //int / void / int1 / int2(array)
    param_num:
    number; //func param num 
}

export class IdentTable {
    private nodes: Node[];

    constructor() {
        this.nodes = [];
    }

    add(name: string, line_num: number, level: number, func_name: string, ident_type: string = 'int', param_num:number = 0) {
        this.nodes.push({ name, line_num, level, func_name, ident_type, param_num });
    }

    clear(){
        this.nodes = [];
    }

    // match(name: string, line_num: number, level: number, func_name: string): boolean {
    //     return this.nodes.some(node => 
    //         node.name === name && node.line_num <= line_num 
    //             && ((node.func_name === func_name && node.level <= level) 
    //                 || (node.level === 0))
    //     );
    // }

    match(name: string, func_name: string): boolean {
        return this.nodes.some(node => 
            node.name === name 
                && (node.func_name === func_name || func_name === 'global')
        );
    }
}
