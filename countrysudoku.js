const dims = { height: 300, width: 300, radius: 150 }
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)
    .attr('height', dims.height + 150)

const graph = svg.append('g')
    .attr('transform', `translate(${cent.x}, ${cent.y})`);

const pie = d3.pie()
    .sort(null)
    .value(d => d.cost);

// const angles = pie([
//     { name: 'rent', cost: 5000 },
//     { name: 'social', cost: 2500 },
//     { name: 'Internet', cost: 1000 }
// ]);

const arcPath = d3.arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 2);

const colour = d3.scaleOrdinal(d3['schemeSet3'])

//legend setup
const legendGroup = svg.append('g')
    // .attr('transform', `translate(${cent.x - 120}, ${dims.height - 70})`);
    .attr('transform', `translate(${dims.width + 40}, 10)`);

const legend = d3.legendColor()
    .shape('circle')
    .shapePadding(10)
    .scale(colour);

const tip = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
        let content = `<div class="name" >${d.data.name}: </div>`
        content += `<div class="cost"> ${d.data.cost} medals</div>`
        // content += `<div class="delete">Click here to delete</div>`
        return content
    });

graph.call(tip);

d3.json('countrysudoku.json').then(data => {
    // const update = (data) => {

    //update colour domain
    colour.domain(data.map(d => d.name));

    // update and call lengend
    legendGroup.call(legend)
    legendGroup.selectAll('text').attr('fill', 'indigo');

    // join enhanced (pie) data to path elements
    const paths = graph.selectAll('path')
        .data(pie(data));

    // handle the exit selection    
    paths.exit()
        .transition().duration(750)
        .attrTween('d', arcTweenExit)
        .remove();

    // handle the current DOM path updates
    paths.attr('d', arcPath)
        .transition().duration(750)
        .attrTween('d', arcTweenUpdate);

    paths.enter()
        .append('path')
        .attr('class', 'arc')
        .attr('d', arcPath)
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('fill', d => colour(d.data.name))
        .each(function (d) { this._current = d })
        .transition().duration(750)
        .attrTween("d", arcTweenEnter);

    // add events
    graph.selectAll('path')
        .on('mouseover', (d, i, n) => {
            tip.show(d, n[i]);
            handleMouseOver(d, i, n)
        })
        .on('mouseout', (d, i, n) => {
            tip.hide();
            handleMouseOut(d, i, n)
        })
});


const arcTweenEnter = (d) => {
    var i = d3.interpolate(d.endAngle, d.startAngle);

    return function (t) {
        d.startAngle = i(t);
        return arcPath(d);
    }
};

const arcTweenExit = (d) => {
    var i = d3.interpolate(d.startAngle, d.endAngle);

    return function (t) {
        d.startAngle = i(t);
        return arcPath(d);
    }
};

// use function keyword to allow use of 'this'
function arcTweenUpdate(d) {
    var i = d3.interpolate(this._current, d);

    //update the current prop with new update data
    this._current = i(1);

    return function (t) {
        return arcPath(i(t));
    }

}

// event handler

const handleMouseOver = (d, i, n) => {
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
        .attr('fill', '#fff')
};

const handleMouseOut = (d, i, n) => {
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
        .attr('fill', colour(d.data.name))
};

const handleClick = (d) => {
    const id = d.data.id;
    db.collection('expenses').doc(id).delete();
};