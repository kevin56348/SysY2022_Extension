interface Node {
    name: string;
    line_num: number;
    level: number;
    func_name: string;
}

export class IdentTable {
    private nodes: Node[];

    constructor() {
        this.nodes = [];
    }

    add(name: string, line_num: number, level: number, func_name: string) {
        this.nodes.push({ name, line_num, level, func_name });
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
