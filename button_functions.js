function addTree(){
    let x = Math.random() * 100 - 50;
    let z = Math.random() * 100 - 50;
    let name = 'tree_'+renderer.objects.length;
    renderer.addObject(name, 'tree', [x,0,z], [0,0,0]);
    console.log(renderer.objects)
}