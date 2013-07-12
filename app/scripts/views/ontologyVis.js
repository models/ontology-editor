/*global define, d3 */
define(
  [
    'flight/lib/component',
    'jquery',
    'd3',
    'd3chart'
  ],

  function(defineComponent)  {
    'use strict';

    function ontologyVis() {
      var w
        , h        
        , vis
        , color = d3.scale.category10()
        , force = d3.layout.force();

      function initView(el, attrs) {
        w = attrs.width;
        h = attrs.height;

        force
          .size([w, h])
          .linkDistance( d3.min([w, h]) / 2 )
          .charge( -(w * 0.8) );

        vis = d3.select(el).append('svg')
          .attr('width', w)
          .attr('height', h);
      }

      function updateVis(evt, x) {
        var d = JSON.parse(x.text)
          , r = 12;

        d.edges.map(function (d) {
          d.source = parseInt(d._inV, 10);
          d.target = parseInt(d._outV, 10);
        });

        force.stop()
          .links(d.edges)
          .nodes(d.vertices);

        // TODO this is inefficient. Comment it out and figure out how to update properly
        vis.selectAll('.link').remove();
        vis.selectAll('.node').remove();

        var link = vis.selectAll('.link')
          .data(force.links());

        link.enter().append('g')
          .attr('class', 'link');
          
        link.append('line')
          .style('stroke-width', 1)
          .style('stroke', 'black');

        link.append('text')
          .attr('class', 'linktext')
          .text(function(d) { return d._label; });

        var node = vis.selectAll('.node')
          .data(force.nodes(), function(d) { return d.name; });

        var g = node.enter().append('g')
          .attr('class', 'node');

        g.append('circle')
          .attr('r', r)
          .style('fill', function(d) { return color(d.group); })
          .call(force.drag)
            .append('title')
            .text(function(d) { return d.group; });

        g.append('text')
          .attr('class', 'nodetext')
          .attr('x', r)
          .attr('dy', '.35em')
          .text(function(d) { return d.name; });

        node.exit().remove();
        
        force.on('tick', function() {
          vis.selectAll('.link line')
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

          vis.selectAll('.link .linktext')
            .attr('dx', function(d) { return (d.source.x + d.target.x)/2; })
            .attr('dy', function(d) { return (d.source.y + d.target.y)/2; });

          vis.selectAll('.node .nodetext')
            .attr('dx', function(d) { return d.x; })
            .attr('dy', function(d) { return d.y; });

          vis.selectAll('.node circle')
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });

        });

        force.start();
      }

      this.after('initialize', function() {
        initView(this.node, this.attr);
        this.on('#ontologyText', 'textChange', updateVis);
      });

    }

    return defineComponent(ontologyVis);
  }
);
