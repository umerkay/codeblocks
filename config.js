class Block {
    static counter = 0;

    constructor() {

    }

    onInput(name, val) {
        this[name] = val;
    }
}

function operand(op) {
    if(op == "null") return op;
    else if(parseFloat(op) == op) return op;
    else return "$" + op;
}

class Var extends Block {

    static type = "var";

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "Name", label: "Set", name: "identifier", value: i => `var${i}` },
            { type: "select", placeholder: "Type", label: "", name: "type", options: ["Text", "Number", "Other Variable", "Expression"], value: "Text" },
            { type: "text", placeholder: "Value", label: "to", name: "value", value: "null" }
        ];
    }

    toPHP() {
        if(this.type == "Text") return `$${this.identifier} = "${this.value}";`;
        else if(this.type == "Number") return `$${this.identifier} = ${this.value};`;
        else if(this.type == "Other Variable") return `$${this.identifier} = $${this.value};`;
        else if(this.type == "Expression") return `$${this.identifier} = (${this.value});`;
    }
}

class Print extends Block {

    static type = "print";

    constructor() {
        super();
        this.inputs = [
            { type: "select", placeholder: "Type", label: "", name: "type", options: ["Text", "Number", "Variable", "Expression"], value: "Text" },
            { type: "text", placeholder: "Type here", label: "", name: "expression" },
            { type: "checkbox", placeholder: "New Line", label: "New Line?", name: "newLine", checked: false },
        ];
    }

    toPHP() {
        if(this.type == "Text") return `echo "${this.expression}${this.newLine ? "&ltbr&gt" : ""}"`;
        else if(this.type == "Number") return `echo ${this.expression}${this.newLine ? '."&ltbr&gt"' : ""}`;
        else if(this.type == "Variable") return `echo $${this.expression}${this.newLine ? '."&ltbr&gt"' : ""}`;
        else if(this.type == "Expression") return `echo (${this.expression})${this.newLine ? '."&ltbr&gt"' : ""}`;
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
            { type: "text", placeholder: "Operand", label: "", name: "operand1" },
            { type: "select", placeholder: "Operator", label: "", name: "operator", options: ["==", "!=", ">", "<", ">=", "<="] },
            { type: "text", placeholder: "Operand", label: "", name: "operand2" },
            
        ];
        this.canHaveChild = true;
    }

    toPHP() {
        return `if (${operand(this.operand1)} ${this.operator} ${operand(this.operand2)}) {`;
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
        if(this.once)
            return `do {`;
        else return `while (${operand(this.operand1)} ${this.operator} ${operand(this.operand2)}) {`;
    }

    endPHP() {
        if(this.once)
            return `} while (${operand(this.operand1)} ${this.operator} ${operand(this.operand2)})`
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
        return `elseif (${operand(this.operand1)} ${this.operator} ${operand(this.operand2)}) {`;
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
        if(this.operator === "^")
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
            { type: "checkbox", placeholder: "Append", label: "Append?", name: "append", checked: false },
        ];
        this.canHaveChild = false;
    }

    toPHP() {
        return `file_put_contents("${this.filename}", "${this.text}" ${this.append ? ",FILE_APPEND" : ""});`;
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
            { type: "text", placeholder: "Function Name", label: "Function", name: "name" },
            { type: "text", placeholder: "Comma Separated", label: "Parameters", name: "parameters", value: "param" },
            // { type: "text", placeholder: "Value", label: "Return", name: "value" },
            // { type: "select", placeholder: "Type", label: "Type", name: "type", options: ["Text", "Number", "Variable", "Expression"], value: "Text" },
        ];
        this.canHaveChild = true;
    }

    toPHP() {
        return `function ${this.name}($${this.parameters.replace(/\s/g, "").split(",").join(", $")}) {`
    }

    // endPHP() {
    //     if(this.type === "Variable")
    //         return `return $${this.value}; }`;
    //     else if(this.type === "Expression")
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
            { type: "select", placeholder: "Type", label: "", name: "type", options: ["Text", "Number", "Variable", "Expression"], value: "Text" },
        ];
    }

    toPHP() {
        if(this.type === "Variable")
            return `return $${this.value};`;
        else if(this.type === "Expression")
            return `return ${this.value};`;
        else
            return `return "${this.value}";`;
    }

    get parents () {
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
            { type: "text", placeholder: "Function Name", label: "Call", name: "name" },
            { type: "text", placeholder: "Comma Separated", label: "Parameters", name: "parameters", value: "param" },
        ];
    }

    toPHP() {
        return `${this.name}(${this.parameters.replace(/\s/g, "").split(",").map(operand).join(", ")});`
    }
}
    


let toRender = [Print, Var, Arithematic, "Conditionals", If, ElseIf, Else, "Loops", For, While, "Files", ReadFile, WriteFile, "Functions", FunctionDef, CallFunction, Return];

// Define variables ✅
// Arithmetic operations ✅
// Function creation ✅
// Loops ✅
// Conditional statements ✅
// Reading a text file
// Writing a text file
// Creating an output node. ✅