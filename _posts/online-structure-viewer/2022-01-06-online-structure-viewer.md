---
layout: post
title:  "Online Structure Viewer"
date:   2022-01-06 12:01:18 +0900
categories: computation
---

> This blog is part of theme collection: Visualization of Aromaticity, see post of [AICD](https://wongzit.github.io/visualization-of-aromaticity-aicd/) in this collection.

<script type="text/javascript" id="hexo.configurations">
  var NexT = window.NexT || {};
  var CONFIG = {
    root: '/',
    scheme: 'Mist',
    version: '6.4.2',
    sidebar: {"position":"left","display":"hide","offset":12,"b2t":false,"scrollpercent":false,"onmobile":false},
    fancybox: false,
    fastclick: false,
    lazyload: false,
    tabs: true,
    motion: {"enable":false,"async":false,"transition":{"post_block":"fadeIn","post_header":"slideDownIn","post_body":"slideDownIn","coll_header":"slideLeftIn","sidebar":"slideUpIn"}},
    algolia: {
      applicationID: '',
      apiKey: '',
      indexName: '',
      hits: {"per_page":10},
      labels: {"input_placeholder":"Search for Posts","hits_empty":"We didn't find any results for the search: ${query}","hits_stats":"${hits} results found in ${time} ms"}
    }
  };
</script>

  <meta name="description" content="Loading... Please refresh if this message persists.           const input_textarea = $(&quot;#coordinates&quot;);      let viewer;      let label_on = true;     let atoms = [];     const bond_length_databa">
<meta property="og:type" content="article">
<meta property="og:title" content="Online Molecular Viewer based on XYZ coordinates">
<meta property="og:url" content="https://liwt31.github.io/2022/01/02/online_viewer/index.html">
<meta property="og:site_name" content="Weitang Li&#39;s blog">
<meta property="og:description" content="Loading... Please refresh if this message persists.           const input_textarea = $(&quot;#coordinates&quot;);      let viewer;      let label_on = true;     let atoms = [];     const bond_length_databa">
<meta property="og:locale" content="en">
<meta property="og:updated_time" content="2022-01-06T01:29:19.604Z">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Online Molecular Viewer based on XYZ coordinates">
<meta name="twitter:description" content="Loading... Please refresh if this message persists.           const input_textarea = $(&quot;#coordinates&quot;);      let viewer;      let label_on = true;     let atoms = [];     const bond_length_databa">

<link rel="canonical" href="https://liwt31.github.io/2022/01/02/online_viewer/"/>
<script type="text/javascript" id="page.configurations">
  CONFIG.page = {
    sidebar: "",
  };
</script>
<title>Online Molecular Viewer based on XYZ coordinates | Weitang Li's blog</title>

<script async src="https://www.googletagmanager.com/gtag/js?id=UA-112074287-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-112074287-1');
</script>
  <script type="text/javascript">
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?bf4c5f63e0485106a91950fc4aa87838";
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();
  </script>

  <noscript>
  <style type="text/css">
    .use-motion .motion-element,
    .use-motion .brand,
    .use-motion .menu-item,
    .sidebar-inner,
    .use-motion .post-block,
    .use-motion .pagination,
    .use-motion .comments,
    .use-motion .post-header,
    .use-motion .post-body,
    .use-motion .collection-title { opacity: initial; }

    .use-motion .logo,
    .use-motion .site-title,
    .use-motion .site-subtitle {
      opacity: initial;
      top: initial;
    }

    .use-motion {
      .logo-line-before i { left: initial; }
      .logo-line-after i { right: initial; }
    }
  </style>
</noscript><!-- hexo-inject:begin --><!-- hexo-inject:end -->

</head>

<body itemscope itemtype="http://schema.org/WebPage" lang="en">

  <!-- hexo-inject:begin --><!-- hexo-inject:end --><div class="container sidebar-position-left page-post-detail">
<div class="headband"></div>

<header id="header" class="header" itemscope itemtype="http://schema.org/WPHeader">
      <div class="header-inner"><div class="site-brand-wrapper">
  <div class="site-meta ">
    

<div class="custom-logo-site-title">
      <a href="/" class="brand" rel="start">
        <span class="logo-line-before"><i></i></span>
        <span class="site-title">Weitang Li's blog</span>
        <span class="logo-line-after"><i></i></span>
      </a>
    </div>
    
<p class="site-subtitle">We've havered enough. Let's get tae work!</p>
      
    
  </div>

  <div class="site-nav-toggle">
    <button aria-label="Toggle navigation bar">
      <span class="btn-bar"></span>
      <span class="btn-bar"></span>
      <span class="btn-bar"></span>
    </button>
  </div>
</div>



<nav class="site-nav">
  
<ul id="menu" class="menu">

<li class="menu-item menu-item-home">
    <a href="/" rel="section">
      <i class="menu-item-icon fa fa-fw fa-home"></i> <br />Home</a>
  </li>
        
<li class="menu-item menu-item-about">
    <a href="/about/" rel="section">
      <i class="menu-item-icon fa fa-fw fa-user"></i> <br />About</a>
  </li>
        
 <li class="menu-item menu-item-archives">
    <a href="/archives/" rel="section">
      <i class="menu-item-icon fa fa-fw fa-archive"></i> <br />Archives</a>
  </li>

</ul>

</nav>
</div>
    </header>

<main id="main" class="main">
      <div class="main-inner">
        <div class="content-wrap">
          
<div id="content" class="content">

  <div id="posts" class="posts-expand">

  <article class="post post-type-normal" itemscope itemtype="http://schema.org/Article">

  <div class="post-block">
    <link itemprop="mainEntityOfPage" href="https://liwt31.github.io/2022/01/02/online_viewer/">

<span hidden itemprop="author" itemscope itemtype="http://schema.org/Person">
      <meta itemprop="name" content="Weitang Li">
      <meta itemprop="description" content="Weitang Li's blog">
      <meta itemprop="image" content="/images/avatar.gif">
    </span>

<span hidden itemprop="publisher" itemscope itemtype="http://schema.org/Organization">
      <meta itemprop="name" content="Weitang Li's blog">
    </span>

    
<header class="post-header">
 
<h1 class="post-title" itemprop="name headline">Online Molecular Viewer based on XYZ coordinates
</h1>
        

<div class="post-meta">
          <span class="post-time">
<span class="post-meta-item-icon">
                <i class="fa fa-calendar-o"></i>
              </span>
              
<span class="post-meta-item-text">Posted on</span>

<time title="Created: 2022-01-02 20:51:59" itemprop="dateCreated datePublished" datetime="2022-01-02T20:51:59+08:00">2022-01-02</time>
<span class="post-meta-divider">|</span>

<span class="post-meta-item-icon">
                  <i class="fa fa-calendar-check-o"></i>
                </span>
                
<span class="post-meta-item-text">Edited on</span>

<time title="Modified: 2022-01-06 09:29:19" itemprop="dateModified" datetime="2022-01-06T09:29:19+08:00">2022-01-06</time>

</span>

</div>
      </header>

<div class="post-body" itemprop="articleBody">

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
