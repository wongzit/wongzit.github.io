---
layout: post
title:  "Online Structure Viewer"
date:   2022-01-06 12:01:18 +0900
categories: computation
---

> This blog is part of theme collection: Visualization of Aromaticity, see post of [AICD](https://wongzit.github.io/visualization-of-aromaticity-aicd/) in this collection.

<script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<script async src="https://cdnjs.cloudflare.com/ajax/libs/3Dmol/1.4.0/3Dmol-min.js" onload="backend_loaded()"></script>

<div id="container" class="mol-container" style="width:100%; height:0; position: relative"></div>
<textarea id="coordinates" title="attributes" rows="10" style="width: 100%; max-width: 100%;">
Loading... Please refresh if this message persists.
</textarea>
<br>
<input type="button" id="toggle_label" value="Turn Label Off">

<script>

    const input_textarea = $("#coordinates");

    let viewer;

    let label_on = true;
    let atoms = [];
    const bond_length_database = {};
    const bond_length_data_url = "https://liwt31.github.io/vendor/bond_length.json";
    $.getJSON(bond_length_data_url, function(data) {
        // load bond length data
        for (const record of data){
            if (record.bond_order != 1){
                // Only deal with single bond for now
                continue;
            }
            bond_length_database[record.elements] = record.length;
            bond_length_database[[record.elements[1], record.elements[0]]] = record.length;
        }
        if (!(viewer === undefined)){
            // backend already loaded. Rerender
            form_bonds(atoms);
            input_textarea.trigger("change");
        }
    });

    input_textarea.on('input change',function(e){
        // main logic
        const coordinates = e.target.value;
        let success;
        try{
            atoms = parse_input(coordinates);
            success = true;
        }
        catch (err) {
            console.log("Error parsing coordinates: ", err);
            atoms = [];
            success = false;
        }
        form_bonds(atoms);
        // rerender
        viewer.removeAllLabels();
        viewer.removeAllModels();
        if (success){
            const m = viewer.addModel();
            m.addAtoms(atoms);
            m.setStyle({},{sphere:{scale:0.3}, stick:{}});
            if (label_on){
                draw_label();
            }
        } else{
            viewer.addLabel("Invalid input",{position: {x:0, y:0, z:0}, backgroundColor:"red"});
        }
        viewer.zoomTo();
        viewer.render();
    });

    function parse_float_throw(s){
        // parse float number but throws exception at NaN
        let res = parseFloat(s);
        if (isNaN(res)){
            throw "invalid float number: " + s
        }
        return res
    }

    function parse_input(coord_str){
        // get xyz coordinates for the atoms
        let atoms = [];
        const lines = coord_str.split("\n");
        for (let line of lines){
            line = line.trim();
            if (line.length == 0){
                continue;
            }
            const elems = line.split(/\s+/);
            if (elems.length < 4){
                throw "invalid line: " + line
            }
            atoms.push({elem: elems[0], x: parse_float_throw(elems[1]), y: parse_float_throw(elems[2]), z: parse_float_throw(elems[3])});
        }
        return atoms;
    }

    function is_bonding(atom_coordinate1, atom_coordinate2){
        const x1 = atom_coordinate1.x;
        const y1 = atom_coordinate1.y;
        const z1 = atom_coordinate1.z;
        const x2 = atom_coordinate2.x;
        const y2 = atom_coordinate2.y;
        const z2 = atom_coordinate2.z;
        const length = Math.sqrt((x1 - x2)**2 + (y1 - y2)**2 + (z1 - z2) ** 2);
        const key = [atom_coordinate1.elem, atom_coordinate2.elem];
        if (!(key in bond_length_database)){
            return false
        }
        // add some tolerance
        return length < 1.3 * bond_length_database[key];
    }

    function form_bonds(atom_coordinates){
        // add bond information in place
        // stick to simple logic and avoid (premature) optimization
        for (const atom_coordinate1 of atom_coordinates){
            const bonds = [];
            for (let i= 0; i < atom_coordinates.length; i++){
                const atom_coordinate2 = atom_coordinates[i];
                if (is_bonding(atom_coordinate1, atom_coordinate2)){
                    bonds.push(i)
                }
            }
            atom_coordinate1.bonds = bonds;
            atom_coordinate1.bondOrder = new Array(bonds.length).fill(1);
        }
    }

    function draw_label(){
        for (let i=0; i<atoms.length; i++){
            let atom = atoms[i];
            viewer.addLabel(`${atom["elem"]}${i+1}`, {position: {x: atom["x"], y: atom["y"], z: atom["z"]}, fontSize:12});
        }
    }

    function backend_loaded(){
        const container = $("#container");
        const config = { backgroundColor: "white" };
        container.height(container.width());
        viewer = $3Dmol.createViewer( container, config );
        // initial values for the textarea
        // in angstrom
        let d = 0.629;
        input_textarea.val(`C 0 0 0\nH -${d} ${d} ${d}\nH ${d} -${d} ${d}\nH -${d} -${d} -${d}\nH ${d} ${d} -${d}`);
        input_textarea.trigger("change");
    }

    $("#toggle_label").on("click", function(e){
        if (label_on){
            viewer.removeAllLabels();
            viewer.render();
            label_on = false;
            e.target.value = "Turn Label On";
        } else{
            draw_label();
            viewer.render();
            label_on = true;
            e.target.value = "Turn Label Off";
        }
    })
</script>

<p>The unit is in Angstrom.</p>
<a id="more"></a>
<p>Quite simple tool powered by <a href="https://github.com/3dmol/3Dmol.js" target="_blank" rel="noopener">3Dmol.js</a>. Auto-detects bond formation using bond length database from <a href="https://github.com/materialsproject/pymatgen" target="_blank" rel="noopener">pymatgen</a>.</p>
<p>Feature requests are welcome by submitting an issue at <a href="https://github.com/liwt31/liwt31.github.io" target="_blank" rel="noopener">https://github.com/liwt31/liwt31.github.io</a>.</p>
