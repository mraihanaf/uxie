/**
 * Plugin documentation for the Explainer Agent
 * These docs teach the AI how to use available visualization libraries
 */

export const LATEX_DOCS = `## LaTeX

You can use LaTeX in your code with the <Latex> tag for mathematical expressions.

Example:
() => {
  return (
    <div>
      <Latex>{"We give illustrations for the processes $e^+e^-$, gluon-gluon and $\\\\gamma\\\\gamma \\\\to W t\\\\bar b$."}</Latex>
      <Latex>{"$2^3$"}</Latex>
    </div>
  );
}

Guidelines:
- Use $ as a delimiter for every math expression inside the <Latex> tag
- Wrap all content in the <Latex> tags with {""}
- Inside the {""} do not use another " as it will close the first " and cause parsing issues
- This is the ONLY way to render math expressions

Bad example (DO NOT DO THIS):
<th style={{padding: 7}}>Estimated $P(\\\\mathrm{Win}\\\\mid \\\\mathrm{Serve})$</th>

Good example:
<th style={{padding: 7}}>Estimated <Latex>{"$P(\\\\mathrm{Win}\\\\mid \\\\mathrm{Serve})$"}</Latex></th>`;

export const CHARTS_DOCS = `## Charts

You have access to the Recharts library via the "Recharts" object for creating charts.

Example:
() => {
  const data = [
    {name: 'Page A', uv: 400}, 
    {name: 'Page B', uv: 500}, 
    {name: 'Page C', uv: 200}
  ];

  return (
    <Recharts.LineChart width={600} height={300} data={data}>
      <Recharts.Line type="monotone" dataKey="uv" stroke="#8884d8" />
      <Recharts.CartesianGrid stroke="#ccc" />
      <Recharts.XAxis dataKey="name" />
      <Recharts.YAxis />
      <Recharts.Tooltip />
      <Recharts.Legend />
    </Recharts.LineChart>
  );
}

Available chart types:
- Recharts.LineChart - Line charts
- Recharts.BarChart - Bar charts  
- Recharts.AreaChart - Area charts
- Recharts.PieChart - Pie charts
- Recharts.RadarChart - Radar charts
- Recharts.ScatterChart - Scatter plots

Common components:
- Recharts.XAxis, Recharts.YAxis - Axes
- Recharts.CartesianGrid - Grid lines
- Recharts.Tooltip - Hover tooltips
- Recharts.Legend - Chart legend
- Recharts.ResponsiveContainer - Responsive wrapper`;

export const PLOTS_DOCS = `## Plots

For complex data visualization and 3D plots, use react-plotly.js via the Plot component.

Example:
() => {
  return (
    <Plot
      data={[
        {
          x: [1, 2, 3],
          y: [2, 6, 3],
          type: 'scatter',
          mode: 'lines+markers',
          marker: {color: 'red'},
        },
        {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
      ]}
      layout={{width: 500, height: 400, title: {text: 'A Fancy Plot'}}}
    />
  );
}

Plot supports:
- 2D charts (scatter, line, bar, pie, etc.)
- 3D charts (surface, scatter3d, mesh3d)
- Statistical charts (histogram, box, violin)
- Scientific charts (contour, heatmap)

For 3D surface plot:
() => {
  return (
    <Plot
      data={[{
        z: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
        type: 'surface'
      }]}
      layout={{title: '3D Surface'}}
    />
  );
}`;

export const CODE_DOCS = `## Code and Syntax Highlighting

Use SyntaxHighlighter to display syntax-highlighted code.

Example:
() => {
  const codeString = \`function hello() {
  console.log("Hello, World!");
}\`;
  
  return (
    <SyntaxHighlighter language="javascript" style={dark}>
      {codeString}
    </SyntaxHighlighter>
  );
}

Guidelines:
- Always use style={dark}, no other styles
- The dark style is already available, no import needed
- Supported languages: javascript, python, java, cpp, html, css, sql, bash, json, typescript, etc.

For multiple code blocks:
() => {
  return (
    <div>
      <h3>JavaScript</h3>
      <SyntaxHighlighter language="javascript" style={dark}>
        {"const x = 1;"}
      </SyntaxHighlighter>
      
      <h3>Python</h3>
      <SyntaxHighlighter language="python" style={dark}>
        {"x = 1"}
      </SyntaxHighlighter>
    </div>
  );
}`;

export const DIAGRAMS_DOCS = `## Diagrams / Flowcharts

Use React Flow library via the RF object for diagrams and flowcharts.

Basic Example:
() => {
  const nodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Start' } },
    { id: '2', position: { x: 0, y: 100 }, data: { label: 'Process' } },
    { id: '3', position: { x: 0, y: 200 }, data: { label: 'End' } },
  ];
  
  const edges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
  ];

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <RF.ReactFlow nodes={nodes} edges={edges} fitView>
        <RF.Controls />
        <RF.Background variant="dots" gap={12} size={1} />
      </RF.ReactFlow>
    </div>
  );
}

With styled nodes:
() => {
  const nodes = [
    { 
      id: '1', 
      position: { x: 100, y: 50 }, 
      data: { label: 'Input' },
      style: { background: '#e1f5fe', border: '1px solid #0288d1' }
    },
    { 
      id: '2', 
      position: { x: 100, y: 150 }, 
      data: { label: 'Process' },
      style: { background: '#fff3e0', border: '1px solid #ff9800' }
    },
  ];
  
  const edges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, label: 'data flow' }
  ];

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <RF.ReactFlow nodes={nodes} edges={edges} fitView>
        <RF.Controls />
        <RF.Background />
      </RF.ReactFlow>
    </div>
  );
}

This is perfect for:
- Flowcharts
- Algorithm visualization
- Process diagrams
- State machines
- Decision trees`;

export const MOTION_DOCS = `## Animations

Use the motion library (Framer Motion) for animations via the motion object.

Basic Animation:
() => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1>Animated Content</h1>
    </motion.div>
  );
}

Hover Animation:
() => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{ padding: '10px 20px', cursor: 'pointer' }}
    >
      Click me!
    </motion.button>
  );
}

Staggered Children:
() => {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}

Use animations to:
- Reveal content on load
- Create interactive hover effects
- Animate state changes
- Guide user attention`;

export const ALL_PLUGIN_DOCS = `
${LATEX_DOCS}

---

${CHARTS_DOCS}

---

${PLOTS_DOCS}

---

${CODE_DOCS}

---

${DIAGRAMS_DOCS}

---

${MOTION_DOCS}
`;

/**
 * Available plugins that will be injected into the component
 */
export const AVAILABLE_PLUGINS = [
    "Latex",
    "Recharts",
    "Plot",
    "SyntaxHighlighter",
    "dark",
    "RF",
    "motion",
    "React",
] as const;

export type PluginName = (typeof AVAILABLE_PLUGINS)[number];
