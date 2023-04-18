class Block {
    static counter = 0;

    constructor() {

    }

    onInput(name, val) {
        this[name] = val;
    }
}

function operand(op, type) {
    if (type) {
        if (type == "Text") return `"${op}"`;
        else if (type == "Number") return op;
        else if (type == "Variable") return `$${op}`;
        else if (type == "PHP Expression") return `(${op})`;
    } else {
        console.log(parseFloat(op), op)
        if (op == "null") return op;
        else if (parseFloat(op) == op) return op;
        else return "$" + op;
    }
}

class Var extends Block {

    static type = "var";

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "Name", label: "Set", name: "identifier", value: i => `var${i}` },
            { type: "text", placeholder: "Value", label: "to", name: "value", value: 0 },
            { type: "select", placeholder: "Type", label: "", name: "type", options: ["Text", "Number", "Variable", "PHP Expression"], value: "Number" },
        ];
    }

    toPHP() {
        return `$${this.identifier} = ${operand(this.value, this.type)};`;
    }
}

class Print extends Block {

    static type = "print";

    constructor() {
        super();
        this.inputs = [
            { type: "select", placeholder: "Type", label: "", name: "type", options: ["Text", "Number", "Variable", "PHP Expression"], value: "Text" },
            { type: "text", placeholder: "Type here", label: "", name: "expression" },
            { type: "checkbox", placeholder: "New Line", label: "New Line?", name: "newLine", checked: false },
        ];
    }

    toPHP() {
        if (this.newLine)
            return `echo ${operand(this.expression, this.type)} . "&ltbr&gt";`;
        else
            return `echo ${operand(this.expression, this.type)};`;
    }
}

class For extends Block {

    static type = "for";

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "Counter Name", label: "", name: "identifier", value: i => `counter${i}` },
            { type: "number", placeholder: "Number", label: "Between", name: "start", value: 0 },
            { type: "number", placeholder: "Number", label: "and", name: "end", value: 10 },
            { type: "number", placeholder: "Increment", label: "Increment", name: "inc", value: 1 },
        ];
        this.canHaveChild = true;
    }

    toPHP() {
        return `for ($${this.identifier} = ${this.start}; $${this.identifier} < ${this.end}; $${this.identifier} += ${this.inc}) {`;
    }
}

class If extends Block {

    static type = "if";

    constructor() {
        super();
        this.inputs = [
            { type: "select", placeholder: "Type", label: "", name: "type1", options: ["Text", "Number", "Variable", "PHP Expression"], value: "Variable" },
            { type: "text", placeholder: "Operand", label: "", name: "operand1" },
            { type: "select", placeholder: "Operator", label: "", name: "operator", options: ["==", "!=", ">", "<", ">=", "<="] },
            { type: "select", placeholder: "Type", label: "", name: "type2", options: ["Text", "Number", "Variable", "PHP Expression"], value: "Number" },
            { type: "text", placeholder: "Operand", label: "", name: "operand2" },

        ];
        this.canHaveChild = true;
    }

    toPHP() {
        return `if (${operand(this.operand1, this.type1)} ${this.operator} ${operand(this.operand2, this.type2)}) {`;
    }
}

class While extends If {

    static type = "while";

    constructor() {
        super();
        this.inputs = [
            ...this.inputs, { type: "checkbox", placeholder: "", label: "Run Atleast Once?", name: "once", checked: false },
        ];
        this.canHaveChild = true;
    }

    toPHP() {
        if (this.once)
            return `do {`
        else return `while (${operand(this.operand1, this.type1)} ${this.operator} ${operand(this.operand2, this.type2)}) {`
    }

    endPHP() {
        if (this.once)
            return `} while (${operand(this.operand1, this.type1)} ${this.operator} ${operand(this.operand2, this.type2)})`
        else return `}`
    }
}

class Else extends Block {

    static type = "else";
    // static parents = ["if", "elseif"];

    constructor() {
        super();
        this.inputs = [];
        this.canHaveChild = true;
    }

    toPHP() {
        return `else {`;
    }
}

class ElseIf extends If {

    static type = "elseif";
    // static parents = ["if", "elseif"];

    constructor() {
        super();
        this.canHaveChild = true;
    }

    toPHP() {
        return `elseif (${operand(this.operand1, this.type1)} ${this.operator} ${operand(this.operand2, this.type2)}) {`;
    }
}

class Arithematic extends Block {

    static type = "math";
    static showTitle = false;

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "Variable", label: "", name: "result" },
            { type: "text", placeholder: "Operand", label: "=", name: "operand1" },
            { type: "select", placeholder: "Operator", label: "", name: "operator", options: ["+", "-", "*", "/", "^"] },
            { type: "text", placeholder: "Operand", label: "", name: "operand2" },
        ];
    }

    toPHP() {
        if (this.operator === "^")
            return `$${this.result} = pow(${operand(this.operand1)},${operand(this.operand2)});`;
        else
            return `$${this.result} = ${operand(this.operand1)} ${this.operator} ${operand(this.operand2)};`;
    }
}

class WriteFile extends Block {
    /* input file name and path
    input text to write
    overwrite / append selection
    */
    static type = "write";

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "File Name", label: "Write to", name: "filename" },
            { type: "text", placeholder: "Text", label: "", name: "text" },
            { type: "select", placeholder: "Type", label: "", name: "type", options: ["Text", "Variable", "PHP Expression"], value: "Text" },
            { type: "checkbox", placeholder: "Append", label: "Append?", name: "append", checked: false },
        ];
        this.canHaveChild = false;
    }

    toPHP() {
        return `file_put_contents("${this.filename}", ${operand(this.text, this.type)} ${this.append ? ",FILE_APPEND" : ""});`;
    }
}

class ReadFile extends Block {
    /* input file name and path
    output text
    */
    static type = "read";

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "Variable", label: "Store in", name: "text" },
            { type: "text", placeholder: "File Name", label: "From File", name: "filename" },
        ];
    }

    toPHP() {
        return `$${this.text} = file_get_contents("${this.filename}");`;
    }
}

class FunctionDef extends Block {
    /* input function name
    input parameters dynamically allowing multiple parameters
    input return type and value
    */
    static type = "function";

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "Function Name", label: "Function", name: "name", value: i => `function${i}` },
            // { type: "text", placeholder: "Comma Separated", label: "Parameters", name: "parameters", value: "" },
            // { type: "text", placeholder: "Value", label: "Return", name: "value" },
            // { type: "select", placeholder: "Type", label: "Type", name: "type", options: ["Text", "Number", "Variable", "PHP Expression"], value: "Text" },
        ];
        this.canHaveChild = true;
    }

    toPHP() {
        if(this.args) {
            return `function ${this.name}(${this.args.map(x => "$" + x.name)}) {`
        }
        return `function ${this.name}() {`

        // if(this.parameters == "") return `function ${this.name}() {`;
        // return `function ${this.name}($${this.parameters.replace(/\s/g, "").split(",").join(", $")}) {`
    }

    // endPHP() {
    //     if(this.type === "Variable")
    //         return `return $${this.value}; }`;
    //     else if(this.type === "PHP Expression")
    //         return `return ${this.value}; }`;
    //     else
    //         return `return "${this.value}";}`;
    // }
}

class Return extends Block {
    /* input return type and value
    */
    static type = "return";
    static parents = ["function"];

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "Value", label: "Return", name: "value" },
            { type: "select", placeholder: "Type", label: "", name: "type", options: ["Text", "Number", "Variable", "PHP Expression"], value: "Text" },
        ];
    }

    toPHP() {
        return `return ${operand(this.value, this.type)};`;
    }

    get parents() {
        return Return.parents;
    }
}

class CallFunction extends Block {
    /* input function name
    input parameters dynamically allowing multiple parameters
    */
    static type = "call";

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "Variable", label: "Store in (Optional)", name: "result" },
            { type: "text", placeholder: "Function Name", label: "Call", name: "name" },
            // { type: "text", placeholder: "Comma Separated", label: "Parameters", name: "parameters", value: "param" },
        ];
    }

    toPHP() {
        if(this.result) {
            if(this.args) {
                return `$${this.result} = ${this.name}(${this.args.map(x => operand(x.name, x.type)).join(", ")});`
            }
            return `$${this.result} = ${this.name}();`
        } else {
            if(this.args) {
                return `${this.name}(${this.args.map(x => operand(x.name, x.type)).join(", ")});`
            }
            return `${this.name}();`
        }
        // return `${this.name}(${this.args.map(x => operand(x.name, x.type))});`
        // return `${this.name}(${this.parameters.replace(/\s/g, "").split(",").map(x => operand(x)).join(", ")});`
    }
}



let toRender = [Print, Var, Arithematic, "Conditionals", If, ElseIf, Else, "Loops", For, While, "Files", ReadFile, WriteFile, "Functions", FunctionDef, CallFunction, Return];

// Define variables ✅
// Arithmetic operations ✅
// Function creation ✅
// Loops ✅
// Conditional statements ✅
// Reading a text file ✅
// Writing a text file ✅
// Creating an output node. ✅