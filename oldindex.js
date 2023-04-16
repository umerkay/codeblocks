const blocks = [];

window.addEventListener("load", () => {

    document.getElementById("droppableRegion").addEventListener("drop", drop_handler)
    document.getElementById("droppableRegion").addEventListener("dragover", dragover_handler)

    for (let droppable of toRender) {
        let dEl = document.createElement("div");
        dEl.classList.add(droppable.type, "droppable");
        dEl.addEventListener("dragstart", dragstart_handler);
        dEl.setAttribute("draggable", true);
        dEl.setAttribute("key", toRender.indexOf(droppable));
        dEl.innerHTML = droppable.type;

        document.getElementById("droppables").appendChild(dEl);
    }
});

function dragstart_handler(ev) {
    // Add the target element's id to the data transfer object
    ev.dataTransfer.setData("key", ev.target.getAttribute("key"));
    ev.dataTransfer.setData("dropEffect", "copy");
    ev.dataTransfer.dropEffect = "copy";
}

function dragover_handler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "copy";
}

function drop_handler(ev) {
    ev.preventDefault();
    let target = ev.target.parentNode.parentNode;
    console.log(target);

    let dropCase = "before";
    if (document.getElementById("blocksContainer").isSameNode(target)) {
        dropCase = "blocks";
    }
    if (dropCase == "before" && target.classList.contains("canHaveChild") && ev.target.classList.contains("inner"))
        dropCase = "inside";


    // if(document.getElementById("blocks").isSameNode(target)) dropCase = "blocks";
    // else if(!target.classList.contains("block")) {
    //     dropCase = "before";
    //     target = ev.target.parentNode.classList.contains("block") ? ev.target.parentNode : ev.target.parentNode.parentNode;
    // }
    // else if(ev.target.classList.contains("block") && ev.target.classList.contains("canHaveChild")) {
    //     dropCase = "child";
    //     return;
    // }

    if (ev.dataTransfer.getData("dropEffect") === "copy") {
        const key = ev.dataTransfer.getData("key");

        const newBlock = new (toRender[parseInt(key)]);
        const newBlockEl = document.createElement("div");
        const newBlockElsCont = document.createElement("div");

        blocks.push(newBlock);

        newBlockEl.classList.add(toRender[parseInt(key)].type, "block");
        newBlockEl.setAttribute("key", blocks.length - 1);
        newBlockEl.setAttribute("id", "block_" + (blocks.length - 1));

        newBlock.inputs.forEach(inp => {
            const inpEl = document.createElement("input");
            const inpElLabel = document.createElement("label");
            for (property in inp) {
                inpEl[property] = inp[property];
            }
            inpElLabel.innerHTML = inp.label;

            inpEl.addEventListener("input", e => newBlock[inp.name] = e.target.value);

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
        });
        newBlockEl.setAttribute("draggable", true);

        const droppableRegionBefore = document.createElement("div");
        droppableRegionBefore.innerHTML = "🔼";
        droppableRegionBefore.classList.add("droppableRegion", "before");
        droppableRegionBefore.addEventListener("drop", drop_handler);
        droppableRegionBefore.addEventListener("dragover", dragover_handler);
        newBlockElsCont.appendChild(droppableRegionBefore);

        if (newBlock.canHaveChild) {
            newBlockEl.classList.add("canHaveChild");
            const droppableRegionBefore = document.createElement("div");
            droppableRegionBefore.innerHTML = "↘";
            droppableRegionBefore.classList.add("droppableRegion", "inner");
            droppableRegionBefore.addEventListener("drop", drop_handler);
            droppableRegionBefore.addEventListener("dragover", dragover_handler);
            newBlockElsCont.appendChild(droppableRegionBefore);
        }

        const droppableRegionAfter = document.createElement("div");
        droppableRegionAfter.innerHTML = "🔽";
        droppableRegionAfter.classList.add("droppableRegion", "after");
        droppableRegionAfter.addEventListener("drop", drop_handler);
        droppableRegionAfter.addEventListener("dragover", dragover_handler);
        newBlockElsCont.appendChild(droppableRegionAfter);

        const deleteBtn = document.createElement("div");
        deleteBtn.innerHTML = "🚮";
        deleteBtn.classList.add("deleteBtn");
        deleteBtn.addEventListener("click", () => newBlockEl.remove());
        newBlockElsCont.appendChild(deleteBtn);

        if (dropCase === "blocks") {
            document.getElementById("blocks").appendChild(newBlockEl);
        } else if (dropCase === "inside") {
            target.appendChild(newBlockEl);
        } else if (dropCase === "before") {
            if (ev.target.classList.contains("before")) {
                target.parentNode.insertBefore(newBlockEl, target);
            } else {
                target.insertAdjacentElement("afterEnd", newBlockEl);
            }
        }
    } else {
        let BlockEl = document.getElementById(ev.dataTransfer.getData("id"));
        if (dropCase === "blocks") {
            document.getElementById("blocks").appendChild(BlockEl);
        } else if (dropCase === "inside") {
            target.appendChild(BlockEl);
        } else if (dropCase === "before") {
            if (ev.target.classList.contains("before")) {
                console.log(target, target.parentNode, BlockEl);
                target.parentNode.insertBefore(BlockEl, target);
            } else {
                target.insertAdjacentElement("afterEnd", BlockEl);
            }
        }
    }


}

function generateCode() {
    document.getElementById("output").innerHTML = "&lt?php";
    _generateCode(document.getElementById("blocks"));
    document.getElementById("output").innerHTML += "</br> ?>";
}

function _generateCode(el) {
    for (blockEl of el.children) {
        if (blockEl.getAttribute("id") == "droppableRegion" || blockEl.classList.contains("container")) continue;
        if (blockEl.classList.contains("canHaveChild")) {
            document.getElementById("output").innerHTML += "<br>" + blocks[parseInt(blockEl.getAttribute("key"))].toPHP();
            _generateCode(blockEl);
            document.getElementById("output").innerHTML += "<br>}";
        } else {
            document.getElementById("output").innerHTML += "<br>" + blocks[parseInt(blockEl.getAttribute("key"))].toPHP();
        }
    }
}