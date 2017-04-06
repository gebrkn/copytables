module.exports.render = h => `
    <style>
        #scroller {
            width: 300px;
            height: 300px;
            overflow: auto;
            border: 3px solid crimson;
        }
    
        #scroller td {
            padding: 10px;
            border: 2px solid bisque;
        }
    
    </style>
    
    <div id="scroller">
        ${h.numTable(20, 30)}
    </div>
    
    ${h.text()}
`;
