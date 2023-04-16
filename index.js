const blocks = [];

window.addEventListener("load", () => {

    document.getElementById("droppableRegion").addEventListener("drop", drop_handler)
    document.getElementById("droppableRegion").addEventListener("dragover", dragover_handler)

    for (let droppable of toRender) {
        if(typeof droppable === "string") {
            let dEl = document.createElement("div");
            dEl.innerHTML = droppable.toUpperCase();
            document.getElementById("droppables").appendChild(dEl);
            continue;
        }
        let dEl = document.createElement("div");
        dEl.classList.add(droppable.type, "droppable");
        dEl.addEventListener("dragstart", dragstart_handler);
        dEl.setAttribute("draggable", true);
        dEl.setAttribute("key", toRender.indexOf(droppable));
        dEl.innerHTML = droppable.type.toUpperCase();

        document.getElementById("droppables").appendChild(dEl);
    }
});

function dragstart_handler(ev) {
    // Add the target element's id to the data transfer object
    ev.dataTransfer.setData("key", ev.target.getAttribute("key"));
    ev.dataTransfer.setData("dropEffect", "copy");
    ev.dataTransfer.dropEffect = "copy";
    document.querySelectorAll(".droppableRegion").forEach(el => el.style.pointerEvents = "auto");
}

function dragenter(e) {
    e.preventDefault();
    e.target.classList.add('dragging');
}

function dragleave(e) {
    e.preventDefault();
    e.target.classList.remove('dragging');
}

function dragover_handler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "copy";
}

function hasParentWithClass(node, className) {
    if(node.classList?.contains(className)) return true;
    if(node.parentNode) return hasParentWithClass(node.parentNode, className);
    return false;
}

function drop_handler(ev) {
    ev.target.classList.remove('dragging');
    document.querySelectorAll(".droppableRegion").forEach(el => el.style.pointerEvents = "none");
    ev.preventDefault();
    let target = ev.target.parentNode.parentNode;

    let dropCase = "before";
    if (document.getElementById("blocksContainer").isSameNode(target)) {
        dropCase = "blocks";
    }
    if (dropCase == "before" && target.classList.contains("canHaveChild") && ev.target.classList.contains("inner"))
        dropCase = "inside";

    if (dropCase == "before" && ev.target.classList.contains("after")) {
        dropCase = "after"
    }

    if (ev.dataTransfer.getData("dropEffect") === "copy") {
        const key = ev.dataTransfer.getData("key");

        const blockClass = toRender[parseInt(key)];

        if(blockClass.type === "elseif" || blockClass.type === "else") {
            if(target.classList.contains("if") || target.classList.contains("elseif")) {
                dropCase = "after";
            } else return window.alert("Can only put" + blockClass.type + " after if/elseif block!");
        }
        
        if(blockClass.parents) {
            if(!hasParentWithClass(target, blockClass.parents[0]) && !hasParentWithClass(target, blockClass.parents[1])) {
                window.alert("Can only put " + blockClass.type + " in " + blockClass.parents.join(" or ") + " block(s)!");
                return 
            } else if(target.classList.contains(blockClass.parents[0])){
                dropCase = "inside";
            }
        }

        blockClass.counter++;
        const newBlock = new (toRender[parseInt(key)]);
        const newBlockEl = document.createElement("div");
        const newBlockElsCont = document.createElement("div");

        const deleteBtn = document.createElement("div");
        deleteBtn.innerHTML = "✖";
        deleteBtn.classList.add("deleteBtn");
        deleteBtn.addEventListener("click", () => newBlockEl.remove());

        if(blockClass.showTitle != false) {
            const title = document.createElement("div");
            title.innerHTML = blockClass.type;
            title.classList.add("title");
            newBlockEl.appendChild(title);
            title.appendChild(deleteBtn);
        }

        blocks.push(newBlock);

        newBlockEl.classList.add(toRender[parseInt(key)].type, "block");
        newBlockEl.setAttribute("key", blocks.length - 1);
        newBlockEl.setAttribute("id", "block_" + (blocks.length - 1));
        newBlockEl.addEventListener("dragenter", dragenter);
        newBlockEl.addEventListener("dragleave", dragleave);

        newBlock.inputs.forEach(inp => {
            const inpEl = document.createElement(inp.type == "select" ? "select" : "input");
            const inpElLabel = document.createElement("label");

            for (let property in inp) {
                if(property === "options") {
                    inp.options.forEach(opt => {
                        const optEl = document.createElement("option");
                        optEl.innerHTML = opt;
                        inpEl.appendChild(optEl);
                    });
                } else inpEl[property] = inp[property] instanceof Function ? inp[property](blockClass.counter) : inp[property];
            }
            inpElLabel.innerHTML = inp.label;

            if(inp.type == "checkbox") {
                inpEl.addEventListener("change", e => newBlock[inp.name] = e.target.checked);
            } else {
                inpEl.addEventListener("input", e => newBlock[inp.name] = e.target.value);
            }
            inpEl.dispatchEvent(new Event("input"));
            inpEl.dispatchEvent(new Event("change"));

            newBlockElsCont.appendChild(inpElLabel);
            newBlockElsCont.appendChild(inpEl);
        });

        newBlockElsCont.classList.add("container");
        newBlockEl.appendChild(newBlockElsCont);

        // const dragBtn = document.createElement("div");
        // dragBtn.innerHTML = "🚗";
        newBlockEl.classList.add("dragBtn");
        newBlockEl.addEventListener("dragstart", (e) => {
            e.stopPropagation();
            e.dataTransfer.setData("id", newBlockEl.getAttribute("id"));
            e.dataTransfer.setData("effect", "move");
            e.dataTransfer.dropEffect = "move";
            document.querySelectorAll(".droppableRegion").forEach(el => el.style.pointerEvents = "auto");

        });
        newBlockEl.setAttribute("draggable", true);

        const droppableRegionBefore = document.createElement("div");
        droppableRegionBefore.classList.add("droppableRegion", "before");
        droppableRegionBefore.addEventListener("drop", drop_handler);
        droppableRegionBefore.addEventListener("dragover", dragover_handler);
        newBlockElsCont.appendChild(droppableRegionBefore);

        const droppableRegionAfter = document.createElement("div");
        droppableRegionAfter.classList.add("droppableRegion", "after");
        droppableRegionAfter.addEventListener("drop", drop_handler);
        droppableRegionAfter.addEventListener("dragover", dragover_handler);
        newBlockElsCont.appendChild(droppableRegionAfter);

        if(blockClass.showTitle == false) {
            newBlockElsCont.appendChild(deleteBtn);
        }

        if (newBlock.canHaveChild) {
            newBlockEl.classList.add("canHaveChild");
            const droppableRegionBefore = document.createElement("div");
            droppableRegionBefore.classList.add("droppableRegion", "inner");
            droppableRegionBefore.addEventListener("drop", drop_handler);
            droppableRegionBefore.addEventListener("dragover", dragover_handler);
            newBlockElsCont.appendChild(droppableRegionBefore);
        }

        if (dropCase === "blocks") {
            document.getElementById("blocks").appendChild(newBlockEl);
        } else if (dropCase === "inside") {
            target.appendChild(newBlockEl);
        } else if (dropCase === "before") {
            target.parentNode.insertBefore(newBlockEl, target);
        } else if(dropCase === "after") {
            target.insertAdjacentElement("afterEnd", newBlockEl);
        }
    } else {
        let BlockEl = document.getElementById(ev.dataTransfer.getData("id"));

        if(BlockEl.classList.contains("elseif") || BlockEl.classList.contains("else")) {
            if(target.classList.contains("if") || target.classList.contains("elseif")) {
                dropCase = "after";
            } else return window.alert("Can only put" + blockClass.type + " after if/elseif block!");
        }
        let blockObj = blocks[parseInt(BlockEl.getAttribute("key"))];
        if(blockObj.parents) {
            if(!hasParentWithClass(target, blockObj.parents) && !hasParentWithClass(target, blockObj.parents)) {
                window.alert("Can only put in " + blockObj.parents.join(" or ") + " block(s)!");
                return 
            } else if(target.classList.contains(blockObj.parents[0])) {
                dropCase = "inside";
            }
        }

        if (dropCase === "blocks") {
            document.getElementById("blocks").appendChild(BlockEl);
        } else if (dropCase === "inside") {
            target.appendChild(BlockEl);
        } else if (dropCase === "before") {
            target.parentNode.insertBefore(BlockEl, target);
        } else if(dropCase === "after") {
            target.insertAdjacentElement("afterEnd", BlockEl);
        }
    }


}

function generateCode() {
    document.getElementById("output").innerHTML = "&lt?php";
    _generateCode(document.getElementById("blocks"), "  ");
    document.getElementById("output").innerHTML += "</br>?>";
}

function _generateCode(el, indent) {
    for (blockEl of el.children) {
        if (blockEl.getAttribute("id") == "droppableRegion" || blockEl.classList.contains("container")  || blockEl.classList.contains("title")) continue;
        let blockObj = blocks[parseInt(blockEl.getAttribute("key"))];
        if (blockEl.classList.contains("canHaveChild")) {
            document.getElementById("output").innerHTML += "<br>" + indent + blockObj.toPHP();
            _generateCode(blockEl, indent + "   ");
            document.getElementById("output").innerHTML += "<br>" + indent + (blockObj.endPHP instanceof Function ? blockObj.endPHP() : "}");
        } else {
            document.getElementById("output").innerHTML += "<br>" + indent + blockObj.toPHP();
        }
    }
}