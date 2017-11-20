const {genLeaderboard} = require('../attachments')
const D3Node = require('d3-node')
const sharp = require('sharp')

module.exports = async (req, res) => {
  const throwdownId = req.params['0']
  const rawData = await genLeaderboard(throwdownId)
  console.log(rawData)
  const data = rawData.data.sort((a, b) => (a.points - b.points))
  console.log(rawData.meta)
  const margin = {top: 20, right: 30, bottom: 30, left: 300}
  const width = 800 - margin.left - margin.right
  const barHeight = 100
  const height = barHeight * data.length - margin.top - margin.bottom

  const svgStyles = `
    .bar-text {
      fill: steelblue;
      font: ${barHeight/3}px sans-serif;
      text-anchor: start;
    }
    .bar-rect {
      fill: steelblue;
    }
    .axis text {
      font: 25px sans-serif;
      fill: black;
    }
    .axis path, .axis line {
      fill: none;
      stroke: none;
    }
    .toolTip {
      position: absolute;
      display: none;
      min-width: 80px;
      height: auto;
      background: none repeat scroll 0 0 #ffffff;
      border: 1px solid #6f257F;
      padding: 14px;
      text-align: center;
    }
  `
  const container = `
    <div id="container">
      <div id="chart">
      </div>
    </div>`

  const options = {
    selector: '#chart',
    container,
    styles: svgStyles
  }

  const d3n = new D3Node(options)
  const d3 = d3n.d3


  const x = d3.scaleLinear().range([0, width])
    .domain([0, d3.max(data, d => d.points) + 50])

  const y = d3.scaleBand().range([height, 0])

  y.domain(data.map(function(d) { return d.user; })).padding(0.1);


  const chart = d3n.createSVG()
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // chart.append('g').attr('class', 'x axis')
  //   .attr('transform', `translate(0, ${height})`)
  //   .call(d3.axisBottom(x).ticks(5))
  const tooltip = d3.select(d3n.document.querySelector('#chart')).append("div").attr("class", "toolTip");

  chart.append('g').attr('class', 'y axis').call(d3.axisLeft(y))

  const bar = chart.selectAll('.bar')
    .data(data).enter()
      .append('g')

  bar.append('rect')
    .attr('class', 'bar-rect')
    .attr('x', 0)
    .attr('height', y.bandwidth())
    .attr('y', d => y(d.user))
    .attr('width', d => x(d.points))
    // .on('mousemove', d => {
    //   tooltip
    //     .style('left', `${d3.event.page - 50}px`)
    //     .style('top', `${d3.event.pageY - 70}px`)
    //     .style('display', 'inline-block')
    //     .html(`${d.user}<br>${d.points}`)
    // })
    // .on('mouseout', d => tooltip.style('display', 'none'))

  bar.append('text')
    .attr('class', 'bar-text')
    .text(d => d.points)
    .attr('x', d => x(d.points) + 10)
    .attr('y', d => y(d.user))
    .attr('dy', '1.25em')

  const html = d3n.svgString()
  console.log(html)
  // const svgBuffer = new Buffer(html)
  // await sharp(svgBuffer)
  //   .toFile('./leaderboards/' + throwdownId + '.png')
  //   .catch(err => console.log(err))


  // res.sendFile(path.join(__dirname, '../../leaderboards', req.params['0'] + '.png'))
  res.render('leaderboard', {meta: rawData.meta, html: d3n.html()})
}
