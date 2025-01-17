class Block {
    static counter = 0;

    constructor() {

    }

    onInput(name, val) {
        this[name] = val;
    }
}

function operand(op, type, lang = "PHP") {
    if (type) {
        if (type == "Text") return lang === "PHP" ? `"${op}"` : `'${op}'`;
        else if (type == "Number") return op;
        else if (type == "Variable") return lang === "PHP" ? `$${op}` : op;
        else if (type == "Expression") return `(${op})`;
    } else {
        if (op == "null") return op;
        else if (parseFloat(op) == op) return op;
        else return lang === "PHP" ? "$" + op : op;
    }
}

class Var extends Block {

    static type = "var";

    constructor() {
        super();
        this.inputs = [
            { type: "text", placeholder: "Name", label: "Set", name: "identifier", value: i => `var${i}` },
            { type: "text", placeholder: "Value", label: "to", name: "value", value: "null" },
            { type: "select", placeholder: "Type", label: "", name: "type", options: ["Text", "Number", "Variable", "Expression"], value: "Number" },
        ];
    }

    to(lang) {
        if (lang === "PHP") {
            return `$${this.identifier} = ${operand(this.value, this.type, lang)};`;
        } else if (lang === "JS") {
            return `let ${this.identifier} = ${operand(this.value, this.type, lang)};`;
        } else if (lang === "Python") {
            return `${this.identifier} = ${operand(this.value, this.type, lang)}`;
        } else if (lang === "C++") {
            return `auto ${this.identifier} = ${operand(this.value, this.type, lang)};`;
        }
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

    to(lang) {
        if (lang === "PHP") {
            return this.newLine ? `echo ${operand(this.expression, this.type, lang)} . "<br>";` : `echo ${operand(this.expression, this.type, lang)};`;
        } else if (lang === "JS") {
            return `console.log(${operand(this.expression, this.type, lang)});`;
        } else if (lang === "Python") {
            return this.newLine ? `print(${operand(this.expression, this.type, lang)})` : `print(${operand(this.expression, this.type, lang)}, end='')`;
        } else if (lang === "C++") {
            return this.newLine ? `cout << ${operand(this.expression, this.type, lang)} << endl;` : `cout << ${operand(this.expression, this.type, lang)};`;
        }
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

    to(lang) {
        if (lang === "PHP") {
            return `for ($${this.identifier} = ${this.start}; $${this.identifier} < ${this.end}; $${this.identifier} += ${this.inc}) {`;
        } else if (lang === "JS") {
            return `for (let ${this.identifier} = ${this.start}; ${this.identifier} < ${this.end}; ${this.identifier} += ${this.inc}) {`;
        } else if (lang === "Python") {
            return `for ${this.identifier} in range(${this.start}, ${this.end}, ${this.inc}):`;
        } else if (lang === "C++") {
            return `for (int ${this.identifier} = ${this.start}; ${this.identifier} < ${this.end}; ${this.identifier} += ${this.inc}) {`;
        }
    }

    end(lang) {
        if (lang === "Python") {
            return "";
        } else {
            return `}`;
        }
    }
}

class If extends Block {

    static type = "if";

    constructor() {
        super();
        this.inputs = [
            { type: "select", placeholder: "Type", label: "", name: "type1", options: ["Text", "Number", "Variable", "Expression"], value: "Variable" },
            { type: "text", placeholder: "Operand", label: "", name: "operand1" },
            { type: "select", placeholder: "Operator", label: "", name: "operator", options: ["==", "!=", ">", "<", ">=", "<="] },
            { type: "select", placeholder: "Type", label: "", name: "type2", options: ["Text", "Number", "Variable", "Expression"], value: "Number" },
            { type: "text", placeholder: "Operand", label: "", name: "operand2" },

        ];
        this.canHaveChild = true;
    }

    to(lang) {
        if (lang === "PHP") {
            return `if (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}) {`;
        } else if (lang === "JS") {
            return `if (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}) {`;
        } else if (lang === "Python") {
            return `if ${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}:`;
        } else if (lang === "C++") {
            return `if (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}) {`;
        }
    }

    end(lang) {
        if (lang === "Python") {
            return "";
        }
        return `}`;
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

    to(lang) {
        if (this.once) {
            if (lang === "PHP") {
                return `do {`;
            } else if (lang === "JS") {
                return `do {`;
            } else if (lang === "Python") {
                return `while True:`;
            } else if (lang === "C++") {
                return `do {`;
            }
        } else {
            if (lang === "PHP") {
                return `while (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}) {`;
            } else if (lang === "JS") {
                return `while (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}) {`;
            } else if (lang === "Python") {
                return `while ${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}:`;
            } else if (lang === "C++") {
                return `while (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}) {`;
            }
        }
    }

    end(lang) {
        if (this.once) {
            if (lang === "PHP") {
                return `} while (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)})`;
            } else if (lang === "JS") {
                return `} while (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)})`;
            } else if (lang === "Python") {
                return `if not (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}): break`;
            } else if (lang === "C++") {
                return `} while (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)})`;
            }
        } else {
            if (lang === "Python") {
                return "";
            }
            return `}`;
        }
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

    to(lang) {
        if (lang === "PHP" || lang === "JS" || lang === "C++") {
            return `else {`;
        } else if (lang === "Python") {
            return `else:`;
        }
    }

    end(lang) {
        if (lang === "Python") {
            return "";
        }
        return `}`;
    }
}

class ElseIf extends If {

    static type = "elseif";
    // static parents = ["if", "elseif"];

    constructor() {
        super();
        this.canHaveChild = true;
    }

    to(lang) {
        if (lang === "PHP") {
            return `elseif (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}) {`;
        } else if (lang === "JS") {
            return `else if (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}) {`;
        } else if (lang === "Python") {
            return `elif ${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}:`;
        } else if (lang === "C++") {
            return `else if (${operand(this.operand1, this.type1, lang)} ${this.operator} ${operand(this.operand2, this.type2, lang)}) {`;
        }
    }

    end(lang) {
        if (lang === "Python") {
            return "";
        }
        return `}`;
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

    to(lang) {
        if (this.operator === "^") {
            if (lang === "PHP") {
                return `$${this.result} = pow(${operand(this.operand1, null, lang)},${operand(this.operand2, null, lang)});`;
            } else if (lang === "JS") {
                return `let ${this.result} = Math.pow(${operand(this.operand1, null, lang)},${operand(this.operand2, null, lang)});`;
            } else if (lang === "Python") {
                return `${this.result} = ${operand(this.operand1, null, lang)} ** ${operand(this.operand2, null, lang)}`;
            } else if (lang === "C++") {
                return `${this.result} = pow(${operand(this.operand1, null, lang)},${operand(this.operand2, null, lang)});`;
            }
        } else {
            if (lang === "PHP") {
                return `$${this.result} = ${operand(this.operand1, null, lang)} ${this.operator} ${operand(this.operand2, null, lang)};`;
            } else if (lang === "JS") {
                return `let ${this.result} = ${operand(this.operand1, null, lang)} ${this.operator} ${operand(this.operand2, null, lang)};`;
            } else if (lang === "Python") {
                return `${this.result} = ${operand(this.operand1, null, lang)} ${this.operator} ${operand(this.operand2, null, lang)}`;
            } else if (lang === "C++") {
                return `${this.result} = ${operand(this.operand1, null, lang)} ${this.operator} ${operand(this.operand2, null, lang)};`;
            }
        }
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
            { type: "select", placeholder: "Type", label: "", name: "type", options: ["Text", "Variable", "Expression"], value: "Text" },
            { type: "checkbox", placeholder: "Append", label: "Append?", name: "append", checked: false },
        ];
        this.canHaveChild = false;
    }

    to(lang) {
        if (lang === "PHP") {
            return `file_put_contents("${this.filename}", ${operand(this.text, this.type, lang)} ${this.append ? ",FILE_APPEND" : ""});`;
        } else if (lang === "JS") {
            return `fs.writeFileSync("${this.filename}", ${operand(this.text, this.type, lang)}, { flag: ${this.append ? "'a'" : "'w'"} });`;
        } else if (lang === "Python") {
            return `with open("${this.filename}", "${this.append ? "a" : "w"}") as file:\n    file.write(${operand(this.text, this.type, lang)})`;
        } else if (lang === "C++") {
            return `ofstream file("${this.filename}", ios::${this.append ? "app" : "out"});\nfile << ${operand(this.text, this.type, lang)};\nfile.close();`;
        }
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

    to(lang) {
        if (lang === "PHP") {
            return `$${this.text} = file_get_contents("${this.filename}");`;
        } else if (lang === "JS") {
            return `let ${this.text} = fs.readFileSync("${this.filename}", "utf8");`;
        } else if (lang === "Python") {
            return `with open("${this.filename}", "r") as file:\n    ${this.text} = file.read()`;
        } else if (lang === "C++") {
            return `ifstream file("${this.filename}");\nstring ${this.text}((istreambuf_iterator<char>(file)), istreambuf_iterator<char>());\nfile.close();`;
        }
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
            { type: "text", placeholder: "Comma Separated", label: "Parameters", name: "parameters", value: "" },
            // { type: "text", placeholder: "Value", label: "Return", name: "value" },
            // { type: "select", placeholder: "Type", label: "Type", name: "type", options: ["Text", "Number", "Variable", "Expression"], value: "Text" },
        ];
        this.canHaveChild = true;
    }

    to(lang) {
        if (lang === "PHP") {
            return this.parameters == "" ? `function ${this.name}() {` : `function ${this.name}($${this.parameters.replace(/\s/g, "").split(",").join(", $")}) {`;
        } else if (lang === "JS") {
            return this.parameters == "" ? `function ${this.name}() {` : `function ${this.name}(${this.parameters.replace(/\s/g, "").split(",").join(", ")}) {`;
        } else if (lang === "Python") {
            return this.parameters == "" ? `def ${this.name}():` : `def ${this.name}(${this.parameters.replace(/\s/g, "").split(",").join(", ")}):`;
        } else if (lang === "C++") {
            return this.parameters == "" ? `void ${this.name}() {` : `void ${this.name}(${this.parameters.replace(/\s/g, "").split(",").map(p => `auto ${p}`).join(", ")}) {`;
        }
    }

    end(lang) {
        if (lang === "Python") {
            return "";
        }
        return `}`;
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

    to(lang) {
        if (lang === "PHP" || lang === "JS" || lang === "C++") {
            return `return ${operand(this.value, this.type, lang)};`;
        } else if (lang === "Python") {
            return `return ${operand(this.value, this.type, lang)}`;
        }
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
            { type: "text", placeholder: "Function Name", label: "Call", name: "name" },
            { type: "text", placeholder: "Comma Separated", label: "Parameters", name: "parameters", value: "param" },
        ];
    }

    to(lang) {
        if (lang === "PHP" || lang === "JS" || lang === "C++") {
            return `${this.name}(${this.parameters.replace(/\s/g, "").split(",").map(p => operand(p, null, lang)).join(", ")});`;
        } else if (lang === "Python") {
            return `${this.name}(${this.parameters.replace(/\s/g, "").split(",").map(p => operand(p, null, lang)).join(", ")})`;
        }
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